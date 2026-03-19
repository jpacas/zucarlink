// Middleware to gate features by plan type
const planGateMiddleware = (requiredPlan = 'pro') => {
  return (req, res, next) => {
    const userPlan = req.user?.planType || 'free'
    if (userPlan === requiredPlan || userPlan === 'pro') {
      return next()
    }
    return res.status(403).json({
      error: 'Esta función requiere el plan Ingeniero Pro',
      upgradeUrl: '/upgrade-pro',
      code: 'plan_required',
    })
  }
}

module.exports = planGateMiddleware
