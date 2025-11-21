export function validate(data: any, _schema?: any) {
  // Placeholder validation logic
  if (!data) {
    throw new Error('Validation failed: no data provided');
  }
  // If schema is provided, pretend validation passes
  return true;
}