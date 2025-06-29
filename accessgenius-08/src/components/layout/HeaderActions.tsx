
import React, { useEffect , useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { BellRing, LogOut, Sun, Moon } from 'lucide-react';
import axios from 'axios';
interface HeaderActionsProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  isAuthenticated: boolean;
}

export const HeaderActions: React.FC<HeaderActionsProps> = ({
  isDarkMode,
  toggleDarkMode,
  isAuthenticated,
}) => {
const user_id= localStorage.getItem("user_id")
const [user, setUser] = useState<{ name: string; email: string } | null>(null);

useEffect(()=>{
  axios.post("http://127.0.0.1:5000/profile",{user_id:user_id},{headers: { "Content-Type": "application/json" }}
)
.then((response) => {
  setUser(response.data.user)})
.catch((error) => {
  console.error('Error fetching user:', error);
        });}, [user_id]);
        console.log(user);
  return (
    <div className="flex items-center gap-2 justify-between">
      <Button 
        variant="ghost" 
        size="icon" 
        className="rounded-full" 
        onClick={toggleDarkMode}
      >
        {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        <span className="sr-only">Toggle theme</span>
      </Button>
      
      {isAuthenticated ? (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="rounded-full h-9 w-9 p-0">
                <Avatar className="h-9 w-9">
                  <AvatarImage src="" alt="User" />
                  <AvatarFallback>{user?.name?.charAt(0)?.toUpperCase() || "?"}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />

              <DropdownMenuItem asChild>
                <Link to="/settings">Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/login" className="flex items-center text-destructive"
                            onClick={() => {
                  localStorage.removeItem("user_id");
                  window.location.href = "/login";
                }}>
                  <LogOut className="mr-2 h-4 w-4" /> Logout
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      ) : (
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost">
            <Link to="/login">Log in</Link>
          </Button>
          <Button asChild>
            <Link to="/register">Sign up</Link>
          </Button>
        </div>
      )}
    </div>
  );
};
