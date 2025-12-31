const errorHandler = (err, req, res, next) => {

    console.error(err);

    res.status(500).send({ message: "Internal server error" });

};

export default errorHandler;
