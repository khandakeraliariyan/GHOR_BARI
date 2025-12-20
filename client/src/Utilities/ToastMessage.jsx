import toast from "react-hot-toast";

const toastStyle = {
    padding: "16px 24px",
    fontSize: "16px",
    background: "#fee2e2",
    color: "#b91c1c",
    fontWeight: "bold",
};

export const showToast = (message, type = "success") => {
    if (type === "success") {
        toast.success(message, {
            duration: 3000,
            style: toastStyle,
        });
    } else if (type === "error") {
        toast.error(message, {
            duration: 3000,
            style: toastStyle,
        });
    }
};
