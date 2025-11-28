import React from 'react';
import { Box, Breadcrumbs, Link, Typography } from '@mui/material';

export interface Crumb {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  crumbs?: Crumb[];
  actionsRight?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  crumbs = [],
  actionsRight,
}) => {
  return (
    <Box
      sx={{
        mb: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <Box>
        {crumbs.length > 0 && (
          <Breadcrumbs>
            {crumbs.map((c, idx) =>
              c.href ? (
                <Link key={idx} color="inherit" underline="hover" href={c.href}>
                  {c.label}
                </Link>
              ) : (
                <Typography
                  key={idx}
                  color="text.primary"
                  sx={{ fontWeight: 700 }}
                >
                  {c.label}
                </Typography>
              )
            )}
          </Breadcrumbs>
        )}
        {title && (
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            {title}
          </Typography>
        )}
      </Box>
      {actionsRight && (
        <Box sx={{ display: 'flex', gap: 1 }}>{actionsRight}</Box>
      )}
    </Box>
  );
};

export default PageHeader;
