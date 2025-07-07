
import React, { useState,useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { FileUp, Eye, Download } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import axios from "axios";
import { Dialog,DialogTrigger,DialogContent,DialogHeader,DialogTitle,DialogClose,} from "@/components/ui/dialog";


const UploadSyllabusTab = () => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [questionGenerated, setQuestionGenerated] = useState(false);
  const [showQuestion, setShowQuestion] = useState(false);
  const [newItems, setNewItems] = useState<
    { marks: number; questions: number; totalMarks: number }[]
  >([]);
  const [menuVisible, setMenuVisible] = useState<number | null>(null);
  const [isGenerateEnabled, setIsGenerateEnabled] = useState(false);
  const [syllabusText, setSyllabusText] = useState("");
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [questions,setQuestions] = useState("");
  const [showPreview,setShowPreview] = useState(false);
  const pdfurl=useRef(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setPdfFile(file);
      setFileName(file.name.replace(".pdf", ""));
      toast({ title: "File uploaded", description: file.name });
    }
  };

  const handleAddNewItem = () => {
    const updatedItems = [
      ...newItems,
      { marks: 0, questions: 0, totalMarks: 0 },
    ];
    setNewItems(updatedItems);
    checkGenerateButton(updatedItems);
  };

  const handleInputChange = (
    index: number,
    field: "marks" | "questions",
    value: string
  ) => {
    let num = Math.max(parseInt(value.trim()) || 0, 0);
    const updatedItems = [...newItems];
    updatedItems[index][field] = num;
    updatedItems[index].totalMarks =
      updatedItems[index].marks * updatedItems[index].questions;
    setNewItems(updatedItems);
    checkGenerateButton(updatedItems);
  };

  const handleGenerateQuestions = async () => {
    if (!pdfFile && syllabusText.trim() === "") {
      toast({
        title: "Missing Syllabus",
        description: "Please upload a file or enter syllabus text.",
        variant: "destructive",
      });
      return;
    }
    try {
      const formData = new FormData();
        if (pdfFile) {
            formData.append("file", pdfFile);
        } else {
            formData.append("syllabus_text", syllabusText);
        }
      

      newItems.forEach((item, index) => {
        formData.append(`marks_${index}`, item.marks.toString());
        formData.append(`questions_${index}`, item.questions.toString());
      });
      
      const res=await axios.post("http://127.0.0.1:5000/Pdffile", formData, {
      headers: { "Content-Type": "multipart/form-data" },
       responseType: "blob"
    });
    for (const [key,value] of formData.entries()){
      console.log(key,value);
    }
    if (res.status === 200) {
        const quest=new Blob([res.data],{type:"application/pdf"})
        pdfurl.current=URL.createObjectURL(quest)
        setQuestions(pdfurl.current);
        setPdfBlob(res.data);
        setQuestionGenerated(true);
    toast({
      title: "Generated!",
      description: "Questions generated successfully.",
    });
}}
    catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate questions. Please try again.",
        variant: "destructive",
      });
    }
  };
  const handleViewQuestion = () => {
      setShowPreview(true); 
    };
  const handleClosePreview = () => {
      setShowPreview(false); 
  };

  const handleDownloadQuestion = () => {
  if (!pdfBlob) return;
  const url = window.URL.createObjectURL(pdfBlob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${fileName}_question_paper.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
  };

  const toggleMenu = (index: number) => {
    setMenuVisible(menuVisible === index ? null : index);
  };

  const handleDeleteItem = (index: number) => {
    const updated = newItems.filter((_, i) => i !== index);
    setNewItems(updated);
    setMenuVisible(null);
    checkGenerateButton(updated);
  };

  const checkGenerateButton = (items: typeof newItems) => {
    const isValid = items.some((item) => item.marks > 0 && item.questions > 0);
    setIsGenerateEnabled(isValid);
  };

  return (
    <div className="space-y-6">
      {/* Upload File */}
      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Label htmlFor="syllabus">Upload PDF</Label>
        <div className="flex items-center gap-2">
          <Input
            id="syllabus"
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={handleFileChange}
          />
          <Button
            variant="outline"
            onClick={() => document.getElementById("syllabus")?.click()}
            className="w-full h-24 flex flex-col gap-2 justify-center border-dashed"
          >
            <FileUp className="h-6 w-6" />
            <span>Drag & drop or click to upload</span>
            <span className="text-xs text-muted-foreground">
              PDF files only
            </span>
          </Button>
        </div>
        {fileName && (
          <p className="text-sm text-muted-foreground">
            Uploaded: {fileName}.pdf
          </p>
        )}
      </div>

      {/* OR enter syllabus text manually */}
      <div className="grid w-full gap-1.5">
        <Label htmlFor="syllabusText">Or paste syllabus content</Label>
        <Textarea
          id="syllabusText"
          placeholder="Type or paste syllabus here..."
          rows={6}
          value={syllabusText}
          onChange={(e) => setSyllabusText(e.target.value)}
        />
      </div>

      {/* Question Types */}
      {newItems.map((item, index) => (
        <div
          key={index}
          className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto_auto] items-center gap-3 w-full border border-muted p-4 rounded-md"
        >
          {/* Marks */}
          <Input
            placeholder="Marks"
            value={item.marks === 0 ? "" : item.marks}
            onChange={(e) => handleInputChange(index, "marks", e.target.value)}
            className="w-full"
          />

          {/* Questions */}
          <Input
            placeholder="No of questions"
            value={item.questions === 0 ? "" : item.questions}
            onChange={(e) =>
              handleInputChange(index, "questions", e.target.value)
            }
            className="w-full"
          />

          {/* Total */}
          <span className="text-sm text-muted-foreground text-center sm:text-left">
            Total: {item.totalMarks}
          </span>

          {/* Menu */}
          <div className="relative justify-self-end">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => toggleMenu(index)}
            >
              ⋮
            </Button>
            {menuVisible === index && (
              <div className="absolute z-10 right-0">
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => handleDeleteItem(index)}
                  className="w-8 h-8"
                >
                  🗑
                </Button>
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Add Type */}
      <Button variant="secondary" onClick={handleAddNewItem}>
        + Add Question Type
      </Button>

      {/* Generate Button */}
      <Button
        className="w-full sm:w-1/2 mx-auto flex items-center justify-center"
        disabled={!isGenerateEnabled}
        onClick={handleGenerateQuestions}
      >
        Generate Questions
      </Button>

      {/* View/Download Buttons */}
      {questionGenerated && (
        <div className="space-y-2 text-center">
          <h3 className="text-lg font-medium">{fileName} Question Paper</h3>
          <div className="flex justify-center gap-4">
            <Dialog open={showPreview} onOpenChange={setShowPreview}>
                <DialogTrigger asChild>
                    <Button variant="outline">
                    <Eye className="w-4 h-4 mr-2" />
                    View Questions
                    </Button>
                </DialogTrigger>
                <DialogContent className="w-full max-w-6xl h-[90vh]">
                    <DialogHeader>
                    <DialogTitle>{fileName} - Question Paper Preview</DialogTitle>
                    </DialogHeader>
                    <div className="w-full h-full overflow-hidden rounded border">
                    <iframe
                        src={questions}
                        title="Question Paper"
                        className="w-full h-[80vh] rounded-md border"
                    />
                    </div>
                    <DialogClose asChild>
                    <Button onClick={handleClosePreview}>Close</Button>
                    </DialogClose>
                </DialogContent>
                </Dialog>
            <Button variant="outline" onClick={handleDownloadQuestion}>
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>
        </div>
      )}

        

    </div>
  );
};

export default UploadSyllabusTab;
