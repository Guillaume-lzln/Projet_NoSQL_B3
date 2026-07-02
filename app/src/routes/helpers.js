// Enveloppe les handlers async pour transmettre les erreurs au middleware d'Express 4.
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

module.exports = { asyncHandler };
