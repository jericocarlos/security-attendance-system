import { executeQuery } from './db'; 

// Function to get a user by username
export async function getUserByIdentifier(identifier) {
  try {
    const users = await executeQuery({
      query: 'SELECT * FROM user_logins WHERE username = ?',
      values: [identifier],
    });
    
    return users.length ? users[0] : null;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}



// // filepath: c:\Users\jcarlos\Downloads\security-attendance-system\lib\user.js
// export function getUserByIdentifier(identifier) {
//   // Dummy user for demonstration
//   if (identifier === "admin") {
//     return { id: 1, username: "admin", password: "admin", role: "Admin" };
//   }
//   if (identifier === "supervisor") {
//     return { id: 2, username: "supervisor", password: "password", role: "Supervisor" };
//   }
//   if (identifier === "manager") {
//     return { id: 3, username: "manager", password: "password", role: "Manager" };
//   }
//   return null;
// }