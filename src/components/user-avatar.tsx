import { Avatar } from '@mui/material';
import { Person } from '@mui/icons-material';

interface UserAvatarProps {
  username: string;
}

export const UserAvatar = ({ username }: UserAvatarProps) => {
  return (
    <Avatar sx={{ bgcolor: 'primary.main' }}>
      <Person />
    </Avatar>
  );
};
