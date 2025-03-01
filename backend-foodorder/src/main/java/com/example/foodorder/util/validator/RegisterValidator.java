package com.example.foodorder.util.validator;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import org.springframework.stereotype.Service;

import com.example.foodorder.domain.request.UserCreateRequestDTO;
import com.example.foodorder.repository.UserRepository;

@Service
public class RegisterValidator implements ConstraintValidator<RegisterChecked, UserCreateRequestDTO> {

    private final UserRepository userRepository;

    public RegisterValidator(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public boolean isValid(UserCreateRequestDTO user, ConstraintValidatorContext context) {
        // if (!user.getPassword().equals(user.getConfirmPassword())) {
        // context.buildConstraintViolationWithTemplate("Mật khẩu không trùng khớp")
        // .addPropertyNode("confirmPassword")
        // .addConstraintViolation()
        // .disableDefaultConstraintViolation();
        // return false;
        // }

        if (this.userRepository.existsByUsername(user.getUsername())) {
            context.buildConstraintViolationWithTemplate("Username đã tồn tại")
                    .addPropertyNode("username")
                    .addConstraintViolation()
                    .disableDefaultConstraintViolation();
            return false;
        }

        if (this.userRepository.existsByEmail(user.getEmail())) {
            context.buildConstraintViolationWithTemplate("Email đã tồn tại")
                    .addPropertyNode("email")
                    .addConstraintViolation()
                    .disableDefaultConstraintViolation();
            return false;
        }

        return true;
    }
}
