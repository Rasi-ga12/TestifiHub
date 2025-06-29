from flask import Blueprint, request, jsonify,send_file,Response
from models import User,db,bcrypt
from flask_jwt_extended import create_access_token
from flask_cors import CORS
from flask_mail import Message
import random
import json,re
from extensions import mail 
from config import Config
from pypdf import PdfReader
from reportlab.lib.enums import TA_LEFT, TA_RIGHT
import google.generativeai as genai
from reportlab.platypus import  SimpleDocTemplate,Paragraph,PageBreak,Spacer,Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet,ParagraphStyle
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from io import BytesIO



routes = Blueprint("routes", __name__)
CORS(routes)

otp_storage = {}


@routes.route("/Signup", methods=["POST"])
def Signup():
    data = request.get_json()
    username, email, password = data["fullname"], data["email"], data["password"]

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email already exists"}), 400
    if User.query.filter_by(username=username).first():
        return jsonify({"error": "Username already exists"}), 400

    new_user = User(username=username, email=email)
    new_user.set_password(password)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"success": True, "message": "User registered successfully"}), 201


@routes.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    user = User.query.filter_by(username=data["username"]).first()

    if user and user.check_password(data["password"]):
        token = create_access_token(identity=user.id)
        return jsonify({"success": True, "message": "Login successful", "token": token})

    return jsonify({"success": False, "error": "Invalid credentials"}), 401


@routes.route('/send-otp', methods=['POST'])
def send_otp():
    data = request.json
    email = data.get("email")
    
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"message": "Email not registered!"}), 400

    otp = str(random.randint(100000, 999999))
    otp_storage[email] = otp
    msg = Message("Password Reset OTP", sender="tthaaimadi@gmail.com", recipients=[email])
    msg.body = f"Your OTP for password reset is: {otp}"
    
    try:
        mail.send(msg)  
    except Exception as e:
        return jsonify({"error": "Failed to send email", "details": str(e)}), 500

    return jsonify({"message": "OTP sent successfully!"})

@routes.route('/verify-otp', methods=['POST'])
def verify_otp():
    data = request.json
    email = data.get("email")
    otp = data.get("otp")

    if email not in otp_storage or otp_storage[email] != otp:
        return jsonify({"message": "Invalid OTP"}), 400

    del otp_storage[email]  
    return jsonify({"message": "OTP verified successfully"}), 200


@routes.route('/reset-password', methods=['POST'])
def reset_password():
    data = request.json
    email = data.get("email")
    new_password = data.get("password")

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"message": "User not found!"}), 400

    hashed_password = bcrypt.generate_password_hash(new_password).decode('utf-8')
    user.password_hash= hashed_password
    db.session.commit()

    return jsonify({"message": "Password reset successful!"}),200

    
@routes.route("/Pdffile", methods=["POST"])

def pdf_file():
    q_type={}
    if "pdfFile" not in request.files:
        return Response(f"No file uploaded",status=400,mimetype="text/plain")
    

    userpdf = request.files["pdfFile"]
    user_filename = request.form.get("fileName")
    difficulty=request.form.get("difficulty")
    newItems_json=request.form.get("newItems","{}")
    newItems= json.loads(newItems_json) 
    print(newItems)
    print(type(newItems))
   

    try:
        reader = PdfReader(userpdf)
        num_pages = len(reader.pages)
        if(num_pages==0):
             return Response(f"the file is empty",status=400,mimetype="text/plain")
        all_text = ""
        for i in range(num_pages): 
            page_text = reader.pages[i].extract_text()
            if page_text:
                all_text += f"Page {i+1}:\n{page_text}\n\n"

        api_key = Config.API_KEY
        if not api_key:
            return Response(f"Error : API key is missing",status=401,mimetype="text/plain")
        try:
            # generating question using ai
            genai.configure(api_key=api_key)
            model=genai.GenerativeModel("gemini-2.0-flash")
            model_response = model.generate_content(contents = (
                f"""
                Generate questions strictly based on the syllabus content provided below with {difficulty} to the syllabus
                Each question should be categorized by its corresponding mark allocation. 
                give the number of question give in the object for each marks  {newItems}. 
                f"Ensure all questions are relevant to the syllabus and do not include any additional information. 
                Syllabus Content:{all_text}
                ### Response Format:
                Your response **must be** a valid JSON dictionary.
                Do **not** include any explanations, extra text, or formatting outside of JSON.
                Strictly follow those keys only:
                include the title also
                {{
                    "Questions":[{{"title":"Ai robotics"}}
                   {{ 
                    "marks":"2 mark",
                    "questions":[
                        " 1.what is robotics ?",
                         "2.what are recent innovation?"
                    ]
                    }},
                    {{
                    "marks":"2 mark",
                    "questions":[
                        " 1.what is ai ?",
                         "2.what is machine learning?"
                    ]
                    }}
                    ] 
                }}
                """
                ))

            response_text = model_response.candidates[0].content.parts[0].text
            #print(response_text)
            #print(type(response_text))
            print("______________________________")
            clean_response = re.sub(r"```json\n|\n```", "", response_text).strip()
            try:
                model_output = json.loads(clean_response)
                #print("Parsed Dictionary:", model_output)
            except json.JSONDecodeError as e:
                print("JSON Decode Error:", e)
                #print("Raw Response:", clean_response)

            
            #print(model_output)
            
            

            if not model_output :
                return Response("AI model did not generate any content", status=500, mimetype="text/plain")
        except Exception as e:
                return Response(f"Google AI Error: {str(e)}", status=500, mimetype="text/plain")

        # converting the text to document
        try:   
            buffer = BytesIO()
            doc = SimpleDocTemplate(buffer, pagesize=A4)
            styles = getSampleStyleSheet()

            elements = []

            # Title
            title = model_output["Questions"][0].get("title", "No Title")
            elements.append(Paragraph(f"<b>{title}</b>", styles["Title"]))
            elements.append(Spacer(1, 10))  
            left_style = ParagraphStyle(name="LeftAlign", parent=styles["Heading2"], alignment=TA_LEFT)
            right_style = ParagraphStyle(name="RightAlign", parent=styles["Heading2"], alignment=TA_RIGHT)

            for item, i in zip(model_output["Questions"][1:], newItems):
                data = [[
                Paragraph(f"<b>{i['marks']} marks</b>", left_style),  
                Paragraph(f"<b>{i['marks']} x {i['questions']} = {i['totalMarks']}</b>", right_style)  
            ]]

            # Create a table with two columns
                table = Table(data, colWidths=[200, 200])  # Adjust widths as needed
                table.setStyle(TableStyle([
                    ('ALIGN', (0, 0), (0, 0), 'LEFT'),    
                    ('ALIGN', (1, 0), (1, 0), 'RIGHT'),  
                    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                    ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
                    ('BOTTOMPADDING', (0, 0), (-1, -1), 5),  # Reduce spacing
                ]))


                elements.append(table)
                elements.append(Spacer(1, 10))
                if "questions" in item:
                    for question in item["questions"]:
                        elements.append(Paragraph(f"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{question}", styles["Normal"]))
                        elements.append(Spacer(1, 13))

                elements.append(Spacer(1, 12))  

            # Build PDF
            doc.build(elements)

            buffer.seek(0)
            return send_file(buffer, mimetype="application/pdf")

        except Exception as e:
            print(f"error:{e}")

    except Exception as e:
        print(f"Error: {e}") 
        return Response(f"Error {str(e)}",status=500 ,mimetype="text/plain") 
    """
    const [recentActivities, setrecentActivities] = useState<any[]>([]);
const [totalAssessments, setTotalAssessments] = useState<any[]>([]);
useEffect(() => {
  
  const fetchRecentActivities = async () => {
    try {
      const user_id = localStorage.getItem("user_id");
      const res=await axios.post('http://127.0.0.1:5000/recent_activity',{user_id})
      setrecentActivities(res.data);
    } 
    catch (error) {
      console.error('Error fetching recent activities:', error);
    }
  };
   
  const total_assessments= async () => {
    try {
      const user_id = localStorage.getItem("user_id");
      const res=await axios.post('http://127.0.0.1:5000/total_assessment',{user_id})
      setTotalAssessments(res.data);
    }
    catch (error) {
      console.error('Error fetching total assessments:', error);
    }}
    fetchRecentActivities();
    total_assessments();
},[]);"""
@routes.route("/code_generator",methods=["POST"])
def code_generator():
    data=request.json
    query=data["query"]
    language=data["language"]
    api_key=Config.API_KEY1
    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel(
        model_name="gemini-2.0-flash",
        generation_config={
        "temperature": 0.2,
        "top_p": 1,
        "top_k": 1,
        "max_output_tokens": 2048,
        })
        code_prompt = f"""
                    Generate the code in {language} for the following task: {query}.
                     Include in-line comments in the code (explain key steps briefly).
                     Do NOT use Markdown formatting.
                     Return a proper explanation of the code in plain text (no markdown).
                     Respond strictly in JSON format like this:
                     {{
                     "code":"print(\\"hello\\"),
                     "explanation":""print is a built-in Python function. It's used to send output to the standard output device, usually the console or terminal. 
                     \\"hello\\" is a string literal, i.e., a sequence of characters surrounded by quotes (\\\" \\\" or '\\' '). 
                     Here, it's the argument to the print() function. Python passes \\"hello\\" into the print() function to be displayed.""
                     }} 
                     Only return a valid JSON object. Do not include anything outside the JSON."""
        code_response = model.generate_content(code_prompt)
        code = re.sub(r"```json\n|\n```", "",code_response.text).strip()
        code_json=json.loads(code)
        
    except Exception as e:
        return jsonify({"message":"{e},something went wrong"}),400
    return jsonify({"code":code_json["code"],"explanation":code_json["explanation"]}),200
    
Analttics
import React, { useState, useEffect } from 'react';
import {
  LineChart,
  BarChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Users, Book, Award } from 'lucide-react';
import ProgressChart, { DualChart } from '@/components/dashboard/ProgressChart';
import MainLayout from '@/components/layout/MainLayout';
import ActivityList from '@/components/dashboard/ActivityList';
import axios from 'axios';
import {toast} from '@/hooks/use-toast';



  // Each entry is a test on a date, with topic, score and difficulty
const topicPerformanceData = [
  { date: '2025-05-01', topic: 'Algebra', score: 78, difficulty: 'easy' },
  { date: '2025-05-01', topic: 'Geometry', score: 65, difficulty: 'medium' },
  { date: '2025-05-02', topic: 'Calculus', score: 72, difficulty: 'hard' },
  { date: '2025-05-03', topic: 'Algebra', score: 85, difficulty: 'easy' },
  { date: '2025-05-04', topic: 'Geometry', score: 55, difficulty: 'medium' },
  { date: '2025-05-04', topic: 'Statistics', score: 90, difficulty: 'hard' },
  { date: '2025-05-05', topic: 'Algebra', score: 80, difficulty: 'easy' },
  { date: '2025-05-06', topic: 'Geometry', score: 55, difficulty: 'medium' },
  { date: '2025-05-07', topic: 'Statistics', score: 90, difficulty: 'hard' },
  { date: '2025-05-08', topic: 'Algebra', score: 80, difficulty: 'easy' },
  { date: '2025-05-09', topic: 'Statistics', score: 90, difficulty: 'hard' },
  { date: '2025-05-10', topic: 'Algebra', score: 80, difficulty: 'easy' },]
  // Add more dummy data across multiple dates and months



// Sample data for charts

const performanceData = [
  { name: 'Jan', highest: 85, average: 75, lowest: 65 },
  { name: 'Feb', highest: 88, average: 78, lowest: 67 },
  { name: 'Mar', highest: 90, average: 80, lowest: 70 },
  { name: 'Apr', highest: 92, average: 82, lowest: 72 },
  { name: 'May', highest: 94, average: 84, lowest: 74 },
  { name: 'Jun', highest: 96, average: 86, lowest: 76 },

];



const subjectPerformanceData = [
  { name: 'Jan', math: 75, science: 68, english: 82 },
  { name: 'Feb', math: 78, science: 72, english: 80 },
  { name: 'Mar', math: 82, science: 75, english: 85 },
  { name: 'Apr', french: 79, science: 60, english: 83 },
  { name: 'May', math: 85, science: 82, english: 88 },
  { name: 'Jun', math: 88, science: 84, english: 90 },
];

const completionData = [
  { name: 'Jan', assigned: 15, completed: 12 },
  { name: 'Feb', assigned: 18, completed: 15 },
  { name: 'Mar', assigned: 20, completed: 18 },
  { name: 'Apr', assigned: 22, completed: 20 },
  { name: 'May', assigned: 25, completed: 22 },
  { name: 'Jun', assigned: 28, completed: 25 },
];



const difficultyColors = {
  easy: '#34d399',    
  medium: '#fbbf24', 
  hard: '#ef4444'  
};

import type { TooltipProps } from 'recharts';

const CustomTooltip: React.FC<TooltipProps<number, string>> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="rounded-md border bg-background p-4 shadow-md">
        <p className="font-semibold text-sm mb-1">{data.name} - Average: {payload[0].value}%</p>
        <p className="font-semibold text-sm mb-1">Number of Assessments: {data.assessmentlength}</p>
      </div>
    );
  }
  return null;
};


const Analytics = () => {

  const dummyFirstLoginYear = 2021;
  const currentYear = new Date().getFullYear();

  const [firstLoginYear] = useState(dummyFirstLoginYear);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  const years = Array.from({ length: currentYear - firstLoginYear + 1 }, (_, i) => firstLoginYear + i);
  const months = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
  ];

  

 const [recentActivities, setrecentActivities] = useState<any[]>([]);
const [totalAssessments, setTotalAssessments] = useState<any>({});
const [userPerformance, setUserPerformance] = useState<any[]>([]);
const [subjectPerformanceData,setsubjectPerformanceData]=useState<any[]>([]);
const [topicPerformanceData,settopicPerformanceData]=useState<any[]>([]);

const user_id = localStorage.getItem("user_id");
useEffect(() => {
   
  const fetchRecentActivities = async () => {
    try {
  
      const res=await axios.post('http://127.0.0.1:5000/recent_activity',{user_id})
      setrecentActivities(res.data);
    } 
    catch (error) {
      console.error('Error fetching recent activities:', error);
    }
  };
   
  const total_assessments= async () => {
    try {
     
      const res=await axios.post('http://127.0.0.1:5000/total_assessment',{user_id})
      setTotalAssessments(res.data);
    }
    catch (error) {
      console.error('Error fetching total assessments:', error);
    }}
  const fetchaverageScore = async () => {
    try {
      const action="average_score"
      const res = await axios.post('http://127.0.0.1:5000/analysis', {action, user_id ,selectedYear});
      setUserPerformance(res.data);
    } catch (error) {
     toast({
      title:'Error '
      ,description: error?.response?.data?.message || "Failed to fetch user performance data."})
     }}
     total_assessments();
    fetchaverageScore();
    fetchRecentActivities();
    
},[]);

{/*useEffect(() => {
    const fetchUserPerformance = async () => {
      try {
        const action = "subject_score";
        const res = await axios.post('http://127.0.0.1:5000/analysis',{action,user_id,selectedYear,selectedMonth})
        setsubjectPerformanceData(res.data[0]);}
    }
    
    fetchUserPerformance();
}, [selectedYear, selectedMonth]);*/}

const monthLabel = months.find(m => m.value === selectedMonth)?.label.slice(0, 3);
const selectedMonthData = subjectPerformanceData.find(d => d.name === monthLabel);
const filteredSubjectPerformance = subjectPerformanceData.filter(d => {
const monthAbbr = months.find(m => m.value === selectedMonth)?.label.slice(0,3);
return d.name === monthAbbr;
 });
const barChartData = selectedMonthData
  ? Object.entries(selectedMonthData)
      .filter(([key]) => key !== 'name')
      .map(([subject, score]) => ({
        subject,
        score,
        color: Number(score) < 75 ? '#ef4444' : '#3b82f6'
      }))
  : [];

 const filteredTopicData = topicPerformanceData.filter((entry) => {
  const entryDate = new Date(entry.date);
  return (
    entryDate.getFullYear() === selectedYear &&
    entryDate.getMonth() + 1 === selectedMonth
  );
});
const uniqueDates = [...new Set(filteredTopicData.map(d => d.date))].sort();

const uniqueTopics = [...new Set(filteredTopicData.map(d => d.topic))];


const chartData = uniqueDates.map(date => {
  const dayObj = { date };
  uniqueTopics.forEach(topic => {
    const found = filteredTopicData.find(d => d.date === date && d.topic === topic);
    dayObj[topic] = found ? found.score : null;  
  });
  return dayObj;
});

const getDifficulty = (topic) => {
  const entry = filteredTopicData.find(d => d.topic === topic);
  return entry ? entry.difficulty : 'easy';
};

  const getBarColor = (value) => (value < 75 ? '#ef4444' : '#3b82f6'); 



  return (
    <MainLayout>
      <div className="flex flex-col gap-6 p-6 overflow-x-hidden max-w-screen">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Comprehensive overview of assessment performance and student engagement metrics.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Assessments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{totalAssessments?.total_assessment?? "Loading..."}</div>
                <Book className="h-8 w-8 text-muted-foreground/70" />
              </div>
              <p className="text-xs text-muted-foreground">{totalAssessments?.percentage ?? "0%"} from last month</p>
            </CardContent>
          </Card>


          

     { /*    <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Active Students</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">1,245</div>
                <Users className="h-8 w-8 text-muted-foreground/70" />
              </div>

              <p className="text-xs text-muted-foreground">+8% from last month</p>

              <p className="text-xs text-muted-foreground">+5% from last month</p>
            </CardContent>
          </Card> */}
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{totalAssessments?.average?? "0%"}</div>
                <Award className="h-8 w-8 text-muted-foreground/70" />
              </div>
              <p className="text-xs text-muted-foreground">{totalAssessments?.approxi_average?? 0} from last month</p>

            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className='min-w-full'>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle>Performance Overview</CardTitle>
              <select
                className="rounded-md border px-2 py-1 text-xs lg:text-sm bg-white text-black dark:text-white dark:bg-black"
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </CardHeader>
            <CardContent className="py-6">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={userPerformance}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <YAxis yAxisId="left" label={{ value: 'Average Score', angle: -90, position: 'insideLeft' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="average"
                    stroke="#8884d8"
                    activeDot={{ r: 8 }}
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className='min-w-full'>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle>Subject Performance</CardTitle>
              <div className="flex flex-col lg:flex-row gap-2">
                <select
                  className="w-16 rounded-md border px-2 py-1 text-xs lg:text-sm bg-white text-black dark:text-white dark:bg-black"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                >
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
                <select
                  className="w-16 rounded-md border px-2 py-1 text-xs lg:text-sm bg-white text-black dark:text-white dark:bg-black"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                >
                  {months.map((month) => (
                    <option key={month.value} value={month.value}>
                      {month.label}
                    </option>
                  ))}
                </select>
              </div>
            </CardHeader>
             <CardContent className=" py-6">
            <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="subject" tickFormatter={(sub) => sub.charAt(0).toUpperCase() + sub.slice(1)} />
            <YAxis domain={[0, 100]} />
            {barChartData.length>0 && <Tooltip content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                return (
                <div className="bg-white border p-2 rounded-md shadow dark:bg-black dark:text-white">
                <p>Average Score: {payload[0].value}</p>
                </div>
              );
            }
            return null;
          }} />}
          <Legend
          verticalAlign="bottom"
          payload={[
          { value: 'Weak', type: 'square', id: 'weak', color: 'red' },
          { value: 'Strength', type: 'square', id: 'strength', color: 'blue' },
          ]}
          />
          <Bar dataKey="score">
            {barChartData.map((entry, index) => (
            <Cell 
            key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  </CardContent>
    </Card>
    </div>
  <div className="grid gap-6 md:grid-cols-2">
  <Card className="min-w-full">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle>Topic Based Performance</CardTitle>
      <div className="flex flex-col lg:flex-row gap-2">
        <select
          className="w-16 rounded-md border px-2 py-1 text-xs lg:text-sm bg-white text-black dark:text-white dark:bg-black"
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
        >
          {years.map((year) => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
        <select
          className="w-16 rounded-md border px-2 py-1 text-xs lg:text-sm bg-white text-black dark:text-white dark:bg-black"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(Number(e.target.value))}
        >
          {months.map((month) => (
            <option key={month.value} value={month.value}>{month.label}</option>
          ))}
        </select>
      </div>
    </CardHeader>

    <CardContent className="py-6">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" tickFormatter={d => d.slice(-2)} />
          <YAxis domain={[0, 100]} />
          {chartData.length > 0 && <Tooltip contentStyle={{
    backgroundColor: '#1e3a8a', 
    borderRadius: '8px',
    border: 'none',
    color: 'white', 
  }}/>}
          <Legend
            verticalAlign="bottom"
            payload={[
              { value: 'hard', type: 'square', id: 'hard', color: '#ef4444' },
              { value: 'medium', type: 'square', id: 'medium', color: '#fbbf24' },
              { value: 'easy', type: 'square', id: 'easy', color: '#34d399' },
            ]}
          />
          {uniqueTopics.map((topic) => (
            <Bar key={topic} dataKey={topic} name={topic}>
              {chartData.map((_, i) => (
                <Cell key={`cell-${i}`} fill={difficultyColors[getDifficulty(topic)]} />
              ))}
            </Bar>
          ))}
        </BarChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
  <ActivityList
        title="Recent Activities"
        activities={recentActivities}
        description="Latest assessment activities and alerts"
  />
   
</div>

    </div>
    </MainLayout>
  );
};

export default Analytics;
