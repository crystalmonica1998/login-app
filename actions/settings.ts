'use server';

import * as z from 'zod';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { SettingsSchema } from '@/schemas';
import { getUserByEmail, getUserById } from '@/data/user';
import { currentUser } from '@/lib/auth';
import { generateVerificationToken } from '@/lib/tokens';
import { sendVerificationEmail } from '@/lib/mail';
import { unstable_update } from '@/auth';

export const settings = async (values: z.infer<typeof SettingsSchema>) => {
    const user = await currentUser();

    if (!user) {
        return { error: 'Unauthorized' };
    }

    const dbUser = await getUserById(user.id!);

    if (!dbUser) {
        return { error: 'Unauthorized' };
    }

    // If client side fails and they send updates for this then don't allow them to update those
    // When sending undefined values, it won't update the field values in the db
    if (user.isOAuth) {
        values.email = undefined;
        values.password = undefined;
        values.newPassword = undefined;
        values.isTwoFactorEnabled = undefined;
    }

    // The user tries to update his email with an email different than the one before
    if (values.email && values.email !== user.email) {
        const existingUser = await getUserByEmail(values.email);

        // Check if a user with this email already exists and that it is different than the logged in user
        if (existingUser && existingUser.id !== user.id) {
            return { error: 'Email already in use!' };
        }

        const verificationToken = await generateVerificationToken(values.email);

        await sendVerificationEmail(verificationToken.email, verificationToken.token);

        return { success: 'Verification email sent!' };
    }

    if (values.password && values.newPassword && dbUser.password) {
        const passwordsMatch = await bcrypt.compare(values.password, dbUser.password);

        if (!passwordsMatch) {
            return { error: 'Incorrect password!'};
        }

        const hashedPassword = await bcrypt.hash(values.newPassword, 10);

        values.password = hashedPassword;
        values.newPassword = undefined;
    }

    await db.user.update({
        where: { id: dbUser.id },
        data: {
            ...values
        }
    });


    // const updatedUser = await db.user.update({
    //     where: { id: dbUser.id },
    //     data: {
    //         ...values
    //     }
    // });

    // unstable_update({
    //     user: {
    //         name: updatedUser.name,
    //         email: updatedUser.email,
    //         role: updatedUser.role,
    //         isTwoFactorEnabled: updatedUser.isTwoFactorEnabled
    //     }
    // });

    return { success: 'Settings Updated!' };
}