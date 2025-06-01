export function getBotReply(userMessage: string): string {
  const message = userMessage.toLowerCase();

  if (message.includes("cancel")) {
    return "To cancel your booking, please go to your bookings page and select the booking you want to cancel.";
  }
  if (message.includes("check-in time") || message.includes("check in time")) {
    return "The standard check-in time is 2 PM. Please check your booking details for specific times.";
  }
  if (message.includes("hello") || message.includes("hi")) {
    return "Hello! How can I assist you today?";
  }
  if (message.includes("thank")) {
    return "You're welcome! If you have any other questions, feel free to ask.";
  }
  return "I'm sorry, I didn't understand that. Could you please rephrase?";
}
