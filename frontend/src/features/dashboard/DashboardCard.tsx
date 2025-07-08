import React from 'react';
import { Card, CardContent, Typography, Box, useTheme, CardActionArea } from '@mui/material';
import type { SvgIconProps } from '@mui/material/SvgIcon';
import { styled } from '@mui/material/styles';

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: React.ReactElement<SvgIconProps>;
  color?: 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
  trend?: {
    value: string;
    direction: 'up' | 'down';
  };
  onClick?: () => void;
}

const StyledCard = styled(Card)(({ theme }) => ({
  minWidth: 275,
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[2],
  transition: 'transform 0.2s, box-shadow 0.2s',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[4],
  },
}));

const DashboardCard: React.FC<DashboardCardProps> = ({ 
  title, 
  value, 
  icon, 
  color = 'primary', 
  trend, 
  onClick 
}) => {
  const theme = useTheme();

  const getTrendColor = () => {
    if (!trend) return 'inherit';
    return trend.direction === 'up' ? theme.palette.success.main : theme.palette.error.main;
  };

  const CardContentWrapper = onClick ? CardActionArea : React.Fragment;

  return (
    <StyledCard onClick={onClick}>
      <CardContentWrapper>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" color="textSecondary" gutterBottom>
              {title}
            </Typography>
            <Box
              sx={{
                backgroundColor: theme.palette[color].light,
                color: theme.palette[color].main,
                borderRadius: '50%',
                width: 40,
                height: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {React.cloneElement(icon, { fontSize: 'small' })}
            </Box>
          </Box>
          <Typography variant="h4" component="div">
            {value}
          </Typography>
          {trend && (
            <Box display="flex" alignItems="center" mt={1}>
              <Typography
                variant="body2"
                sx={{ color: getTrendColor(), display: 'flex', alignItems: 'center' }}
              >
                {trend.value}
                {trend.direction === 'up' ? '↑' : '↓'}
              </Typography>
              <Typography variant="caption" color="textSecondary" ml={1}>
                vs last period
              </Typography>
            </Box>
          )}
        </CardContent>
      </CardContentWrapper>
    </StyledCard>
  );
};

export default DashboardCard;