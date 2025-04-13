import bcrypt from "bcryptjs";

const testHash = async () => {
  const hash = "$2b$10$cZx3Ss7mCtZ03FZGDuYdyeYFB2wdCpXxS3pJBkLZ9YxQRwxZYbXuG"; // Replace with your hash
  const password = "password123"; // Replace with the password to test

  const isMatch = await bcrypt.compare(password, hash);
  console.log(isMatch ? "Password matches the hash!" : "Password does not match.");
};

testHash();
