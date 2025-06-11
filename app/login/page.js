// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";

// export default function LoginPage() {
//   const [username, setUsername] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");
//   const router = useRouter();

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     // Dummy authentication logic
//     if (username === "admin" && password === "admin") {
//       router.push("/admin");
//     } else if ((username === "supervisor" || username === "manager") && password === "password") {
//       router.push("/admin");
//     } else {
//       setError("Invalid credentials");
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-slate-100">
//       <div className="bg-white p-8 rounded shadow-md w-full max-w-sm">
//         <h1 className="text-2xl font-bold mb-6 text-center">Employee Management & Attendance Logs</h1>
//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div>
//             <label className="block mb-1 font-medium">Username</label>
//             <input
//               type="text"
//               className="w-full border border-slate-300 rounded px-3 py-2"
//               value={username}
//               onChange={(e) => setUsername(e.target.value)}
//               required
//               autoFocus
//             />
//           </div>
//           <div>
//             <label className="block mb-1 font-medium">Password</label>
//             <input
//               type="password"
//               className="w-full border border-slate-300 rounded px-3 py-2"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               required
//             />
//           </div>
//           {error && <div className="text-red-500 text-sm">{error}</div>}
//           <button
//             type="submit"
//             className="w-full bg-blue-700 text-white py-2 rounded hover:bg-blue-800 transition"
//           >
//             Login
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// }

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { AUTH_CONSTANTS } from '@/constants/auth';
import { LoginForm } from '@/components/auth/LoginForm';
import { CompanyLogo } from '@/components/ui/LoadingSpinner';
import { FooterInfo } from '@/components/auth/FooterInfo';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAnimation } from '@/hooks/useAnimation';


export default function LoginPage() {
  // =============
  // Custom hooks
  // =============
  const { login } = useAuth();
  const [shakeForm, triggerShake] = useAnimation('shake', 500);
  
  // =============
  // State
  // =============
  const [isLoading, setIsLoading] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState(null);
  
  // =============
  // Effects
  // =============
  useEffect(() => {
    setCurrentDateTime(AUTH_CONSTANTS.CURRENT_YEAR);
  }, []);
  
  // =============
  // Event handlers
  // =============
  const handleSubmit = async (data) => {
    setIsLoading(true);
    
    try {
      const result = await login(data);
      
      if (!result.success) {
        triggerShake();
        setIsLoading(false);
        return { error: AUTH_CONSTANTS.ERROR_MESSAGES.INVALID_CREDENTIALS };
      }
      
      return { success: true };
    } catch (error) {
      setIsLoading(false);
      triggerShake();
      return { error: AUTH_CONSTANTS.ERROR_MESSAGES.GENERAL_ERROR };
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4" data-testid="login-page">
      <div className={`w-full max-w-md ${shakeForm ? 'animate-shake' : ''}`}>
        <Card className="w-full">
          <CardHeader className="space-y-1 text-center">
            <CompanyLogo />
            <CardTitle className="text-2xl font-bold">{AUTH_CONSTANTS.LABELS.TITLE}</CardTitle>
            <CardDescription>{AUTH_CONSTANTS.LABELS.SUBTITLE}</CardDescription>
          </CardHeader>
          
          <CardContent>
            <LoginForm 
              onSubmit={handleSubmit} 
              isLoading={isLoading} 
            />
          </CardContent>
          
          <CardFooter className="flex justify-center">
            <FooterInfo 
              year={currentDateTime} 
              company={AUTH_CONSTANTS.COMPANY_NAME} 
            />
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}