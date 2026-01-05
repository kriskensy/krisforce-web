import { redirect } from 'next/navigation';
import { verifyAccessLevel } from './verifyAccessLevel';

export async function requireLevelRedirect(level) {
  try {
    return await verifyAccessLevel(level);
  } catch (error) {
    if (error.message === 'UNAUTHORIZED_ACCESS') {
      redirect('/protected?error=unauthorized');
    }
    throw error;
  }
}