import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcryptjs';
import { UserPayload, JWTPayload } from '../types/auth';
import type { StringValue } from 'ms';
import type { SignOptions } from 'jsonwebtoken';

// JWT token generation function
export const generateToken = (user: UserPayload): string => {
    const payload: JWTPayload = {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
    };

    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('JWT_SECRET is not defined in environment variables');
    }

    const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
    const options: SignOptions = { expiresIn: expiresIn as StringValue };
    return jwt.sign(payload, secret, options);
};

// JWT token verification function
export const verifyToken = (token: string): JWTPayload => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('JWT_SECRET is not defined in environment variables');
    }

    try {
        const decoded = jwt.verify(token, secret) as JWTPayload;
        return decoded;
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            throw new Error('Token expired');
        } else if (error instanceof jwt.JsonWebTokenError) {
            throw new Error('Invalid token');
        } else {
            throw new Error('Token verification failed');
        }
    }
};

// Password hashing function
export const hashPassword = async (password: string): Promise<string> => {
    try {
        const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12');
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        return hashedPassword;
    } catch (error) {
        throw new Error('Error hashing password');
    }
};

// Password comparison function
export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
    try {
        const isMatch = await bcrypt.compare(password, hashedPassword);
        return isMatch;
    } catch (error) {
        throw new Error('Error comparing passwords');
    }
};