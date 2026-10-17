// Toast notification helpers.
import { sileo } from "sileo";

// Show success toast message.
export const toastSuccess = (title, description = "") =>
  sileo.success({
    title,
    description,
    fill: "#15803d",
    styles: {
      title: "text-white!",
      description: "text-white!",
      badge: "bg-white! text-[#15803d]!",
    },
  });

// Show error toast message.
export const toastError = (title, description = "") =>
  sileo.error({
    title,
    description,
    fill: "#DC2626",
    styles: {
      title: "text-white!",
      description: "text-white!",
      badge: "bg-white! text-[#DC2626]!",
    },
  });
