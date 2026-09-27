import Swal from "sweetalert2";

export const showSuccess = (message, title = "Success!") => {
  return Swal.fire({
    icon: "success",
    title,
    text: message,

    showCancelButton: true,

    confirmButtonText: "OK",
    cancelButtonText: "Cancel",

    confirmButtonColor: "#2563eb",
    cancelButtonColor: "#6b7280",

    reverseButtons: true
  });
};

export const showError = (message, title = "Error!") => {
  return Swal.fire({
    icon: "error",
    title,
    text: message,
    confirmButtonText: "OK",
    confirmButtonColor: "#dc2626"
  });
};

export const showWarning = (message, title = "Warning!") => {
  return Swal.fire({
    icon: "warning",
    title,
    text: message,
    confirmButtonText: "OK",
    confirmButtonColor: "#f59e0b"
  });
};

export const showConfirm = async (
  message,
  title = "Are you sure?"
) => {
  const result = await Swal.fire({
    icon: "warning",
    title,
    text: message,
    showCancelButton: true,
    confirmButtonText: "Yes",
    cancelButtonText: "Cancel",
    confirmButtonColor: "#dc2626",
    cancelButtonColor: "#64748b"
  });

  return result.isConfirmed;
};