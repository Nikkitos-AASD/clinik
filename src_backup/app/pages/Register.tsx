import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { AsYouType } from 'libphonenumber-js';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { useApp } from '../context/AppContext';
import { toast } from 'sonner';

// Схема валидации формы регистрации
const registerSchema = z
  .object({
    lastName: z
      .string()
      .min(1, 'Фамилия обязательна')
      .regex(/^[А-Яа-яЁёA-Za-z-]+$/, 'Фамилия не должна содержать цифр'),
    firstName: z
      .string()
      .min(1, 'Имя обязательно')
      .regex(/^[А-Яа-яЁёA-Za-z-]+$/, 'Имя не должно содержать цифр'),
    middleName: z
      .string()
      .optional()
      .or(z.literal(''))
      .refine(
        (value) => !value || /^[А-Яа-яЁёA-Za-z-]+$/.test(value),
        'Отчество не должно содержать цифр'
      ),
    phone: z
      .string()
      .min(1, 'Номер телефона обязателен')
      .refine(
        (value) => {
          const digits = value.replace(/\D/g, '');
          return digits.length === 11 && digits.startsWith('7');
        },
        'Номер телефона должен содержать 11 цифр и начинаться с 7'
      ),
    email: z
      .string()
      .min(1, 'Email обязателен')
      .email('Некорректный формат email'),
    password: z
      .string()
      .min(8, 'Пароль должен содержать минимум 8 символов')
      .regex(/[A-ZА-Я]/, 'Добавьте хотя бы одну заглавную букву')
      .regex(/[a-zа-я]/, 'Добавьте хотя бы одну строчную букву')
      .regex(/\d/, 'Добавьте хотя бы одну цифру')
      .regex(/[^A-Za-zА-Яа-я0-9]/, 'Добавьте хотя бы один спецсимвол'),
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { register: registerUser, isLoading } = useApp();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      lastName: '',
      firstName: '',
      middleName: '',
      phone: '+7',
      email: '',
      password: '',
    },
  });

  // Надёжное форматирование телефона через libphonenumber-js (AsYouType)
  const handlePhoneChange = (value: string) => {
    const formatter = new AsYouType('RU');
    const formatted = formatter.input(value);
    setValue('phone', formatted, { shouldValidate: true });
  };

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const trimmedLast = data.lastName.trim();
      const trimmedFirst = data.firstName.trim();
      const trimmedMiddle = data.middleName?.trim() || '';

      const fullName =
        trimmedMiddle.length > 0
          ? `${trimmedLast} ${trimmedFirst} ${trimmedMiddle}`
          : `${trimmedLast} ${trimmedFirst}`;

      await registerUser(fullName, data.phone, data.email, data.password);

      toast.success('Регистрация прошла успешно! Пожалуйста, войдите в систему.');
      navigate('/login');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Ошибка регистрации');
    }
  };

  return (
    <div className="min-h-[calc(100vh-88px)] bg-secondary flex items-center justify-center py-20 px-8">
      <div className="max-w-[480px] w-full">
        <div className="bg-white rounded-lg p-12">
          <h2 className="mb-8">Регистрация</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <Input
                label="Фамилия"
                placeholder="Иванова"
                {...register('lastName')}
              />
              {errors.lastName && (
                <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>
              )}
              <p className="text-muted-foreground mt-2">Без цифр</p>
            </div>

            <div>
              <Input
                label="Имя"
                placeholder="Мария"
                {...register('firstName')}
              />
              {errors.firstName && (
                <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>
              )}
              <p className="text-muted-foreground mt-2">Без цифр</p>
            </div>

            <div>
              <Input
                label="Отчество"
                placeholder="Петровна"
                {...register('middleName')}
              />
              {errors.middleName && (
                <p className="text-red-500 text-sm mt-1">{errors.middleName.message}</p>
              )}
              <p className="text-muted-foreground mt-2">Необязательное поле</p>
            </div>

            <div>
              <Input
                label="Номер телефона"
                placeholder="+7 (___) ___-__-__"
                {...register('phone')}
                onChange={(e) => handlePhoneChange(e.target.value)}
              />
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
              )}
              <p className="text-muted-foreground mt-2">
                11 цифр с учётом кода страны
              </p>
            </div>

            <div>
              <Input
                label="Электронная почта"
                type="email"
                placeholder="example@mail.com"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
              )}
              <p className="text-muted-foreground mt-2">
                Проверяется формат email по стандарту
              </p>
            </div>

            <div className="relative">
              <Input
                label="Пароль"
                type={showPassword ? 'text' : 'password'}
                placeholder=""
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-[44px] text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
              )}
              <p className="text-muted-foreground mt-2">
                Минимум 8 символов, буквы разного регистра, цифры и спецсимвол
              </p>
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
              {isLoading && <Loader2 className="animate-spin mr-2" size={16} />}
              Зарегистрироваться
            </Button>

            <div className="text-center">
              <span className="text-muted-foreground">Уже есть аккаунт? </span>
              <Link to="/login" className="text-primary hover:underline">
                Войти
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}