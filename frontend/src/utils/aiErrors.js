export function getAiErrorMessage(err, fallback = 'AI generation failed. Please try again.') {
  const msg = err?.response?.data?.error || err?.message || fallback;
  if (msg.includes('GoogleGenerativeAI') || msg.includes('503') || msg.includes('high demand')) {
    return 'The AI service is temporarily busy. Please wait a moment and click Generate again.';
  }
  return msg;
}
