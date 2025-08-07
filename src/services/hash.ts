import bcrypt from "bcryptjs";

async function hashPassword(password: string): Promise<string> {
	const saltRounds = 12;

	const hashedPassword = await bcrypt.hash(password, saltRounds);

	return hashedPassword;
}

async function verifyPassword(
	password: string,
	hashedPassword: string,
): Promise<boolean> {
	const isPasswordValid = await bcrypt.compare(password, hashedPassword);

	return isPasswordValid;
}

export { hashPassword, verifyPassword };
