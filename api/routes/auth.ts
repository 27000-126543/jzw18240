import { Router, type Request, type Response } from 'express'
import { db } from '../db.js'

const router = Router()

router.post('/login', async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body
  if (!email || !password) {
    res.status(400).json({ success: false, error: '请提供邮箱和密码' })
    return
  }
  const user = db.users.findByEmail(email)
  if (!user || user.password !== password) {
    res.status(401).json({ success: false, error: '邮箱或密码错误' })
    return
  }
  res.json({ success: true, data: { id: user.id, name: user.name, email: user.email, role: user.role, rank: user.rank, department: user.department } })
})

router.get('/me', async (_req: Request, res: Response): Promise<void> => {
  const user = db.users.findById(1)
  if (!user) {
    res.status(404).json({ success: false, error: '用户不存在' })
    return
  }
  res.json({ success: true, data: { id: user.id, name: user.name, email: user.email, role: user.role, rank: user.rank, department: user.department } })
})

export default router
