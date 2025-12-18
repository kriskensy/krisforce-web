import { getUserAccessLevel } from './getUserAccessLevel.js'

export async function verifyAccessLevel(requiredLevel) {
  const accessInfo = await getUserAccessLevel()
  
  if (accessInfo.level < requiredLevel) {
    throw new Error('Unauthorized: Insufficient access level')
  }

  return accessInfo
}
