
/**
 * Middleware to verify user is owner
 * Compares request user email with query parameter email
 */
export const verifyOwner = (req, res, next) => {

    const email = req.query.email;


    // Verify email matches authenticated user
    if (req.user.email !== email) {

        return res.status(403).send({ message: "Forbidden Access" });

    }


    // Email matches, proceed
    next();

};
