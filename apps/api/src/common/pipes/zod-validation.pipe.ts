import { Request, Response, NextFunction } from 'express';

export function ZodValidationPipe(validatorFn: (data: any) => { isValid: boolean; errors: any }) {
  return (req: Request, res: Response, next: NextFunction) => {
    const { isValid, errors } = validatorFn(req.body);
    if (!isValid) {
      return res.status(400).json({
        statusCode: 400,
        message: 'Dữ liệu yêu cầu không hợp lệ.',
        errors,
      });
    }
    next();
  };
}
