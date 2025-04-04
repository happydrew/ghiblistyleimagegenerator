import React, { useState } from 'react';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

const PasswordInput = ({ label, password, onPasswordChange, passwordError, setPasswordError }: {
    label?: string,
    password: string,
    onPasswordChange: (password: string) => void,
    passwordError?: string | null,
    setPasswordError?: (message: string | null) => void
}) => {
    const [showPassword, setShowPassword] = useState(false);

    const handleClickShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const handleMouseDownPassword = (event) => {
        event.preventDefault();
    };

    return (
        <TextField
            label={label || 'Password'}
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={e => onPasswordChange(e.target.value)}
            fullWidth
            error={Boolean(passwordError)}
            helperText={passwordError}
            InputProps={{
                endAdornment: (
                    <InputAdornment position="end">
                        <IconButton
                            aria-label="toggle password visibility"
                            onClick={handleClickShowPassword}
                            onMouseDown={handleMouseDownPassword}
                        >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                    </InputAdornment>
                ),
            }}
        />
    );
};

export default PasswordInput;
