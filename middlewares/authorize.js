// middleware/auth.js
import jwt from 'jsonwebtoken'
import { User } from '../models/user.model.js'

export const authorize = (allowedRoles) => {
  return async(req, res, next) => {
    try {
      const authHeader = req.headers.authorization

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized access' })
      }

      const token = authHeader.split(' ')[1]
      const decoded = jwt.verify(token, process.env.JWT_SECRET)

      // console.log("decoded roke is ", decoded)

      const userFound = await User.findById(decoded.id);

  //  console.log("user found is ", userFound,  " and the allowed roles is ", allowedRoles);
      if(!userFound) {
        return res.satus(404).json({message: "User not found"});
      }

      if (!allowedRoles.includes(userFound.role)) {
        return res.status(403).json({ message: 'Forbidden: Insufficient role' })
      }
      // console.log("requesting user is ", decoded)
      req.user = { _id: userFound._id, role: userFound.role }
      next()
    } catch (err) {
      res.status(401).json({ message: 'Invalid or expired token' })
    }
  }
}
