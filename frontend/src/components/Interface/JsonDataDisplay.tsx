import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Collapse,
  Paper,
} from '@mui/material';
import ArrayDataTable from './ArrayDataTable';

interface JsonDataDisplayProps {
  data: string | undefined;
  title: string;
}

const JsonDataDisplay: React.FC<JsonDataDisplayProps> = ({ data, title }) => {
  const [expandedArrays, setExpandedArrays] = useState<{ [key: string]: boolean }>({});

  if (!data) return null;

  const toggleArrayExpansion = (arrayKey: string) => {
    setExpandedArrays(prev => ({
      ...prev,
      [arrayKey]: !prev[arrayKey]
    }));
  };

  const formatJsonWithArrayPlaceholders = (jsonString: string) => {
    try {
      const parsed = JSON.parse(jsonString);
      const processedData = { ...parsed };
      const arrayKeys: string[] = [];

      // Find array properties and replace with placeholder
      Object.keys(parsed).forEach(key => {
        if (Array.isArray(parsed[key])) {
          processedData[key] = `배열 - ${parsed[key].length}개 항목`;
          arrayKeys.push(key);
        }
      });

      return {
        displayJson: JSON.stringify(processedData, null, 2),
        originalData: parsed,
        arrayKeys
      };
    } catch (error) {
      return {
        displayJson: jsonString,
        originalData: null,
        arrayKeys: []
      };
    }
  };

  const { displayJson, originalData, arrayKeys } = formatJsonWithArrayPlaceholders(data);

  const renderJsonWithClickableArrays = (jsonStr: string, arrays: string[], original: any) => {
    if (!original || arrays.length === 0) {
      return (
        <pre style={{ margin: 0, fontSize: '12px', fontFamily: 'monospace' }}>
          {jsonStr}
        </pre>
      );
    }

    // Split the JSON string into lines and process each line
    const lines = jsonStr.split('\n');
    const processedLines = lines.map((line, index) => {
      // Check if this line contains an array placeholder
      const arrayKey = arrays.find(key => line.includes(`"${key}"`));
      
      if (arrayKey && line.includes('배열 -')) {
        // Replace the array placeholder with a clickable button
        const beforeColon = line.substring(0, line.indexOf(':'));
        const indentation = beforeColon.match(/^\s*/)?.[0] || '';
        
        return (
          <div key={index} style={{ display: 'flex', alignItems: 'center', marginLeft: indentation.length * 8 }}>
            <span style={{ fontSize: '12px', fontFamily: 'monospace' }}>
              {beforeColon}:
            </span>
            <Button
              size="small"
              variant="outlined"
              onClick={() => toggleArrayExpansion(arrayKey)}
              sx={{ 
                ml: 1, 
                fontSize: '11px', 
                minHeight: '20px',
                padding: '2px 8px'
              }}
            >
              {expandedArrays[arrayKey] ? '숨기기' : '자세히 보기'} ({original[arrayKey].length}개 항목)
            </Button>
          </div>
        );
      }
      
      return (
        <div key={index} style={{ fontSize: '12px', fontFamily: 'monospace' }}>
          {line}
        </div>
      );
    });

    return <>{processedLines}</>;
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom color="primary">
        {title} (JSON)
      </Typography>
      
      {/* Main JSON display with clickable array placeholders */}
      <Box
        sx={{
          backgroundColor: '#f5f5f5',
          padding: 2,
          borderRadius: 1,
          border: '1px solid #ddd',
          maxHeight: 400,
          overflow: 'auto',
        }}
      >
        {renderJsonWithClickableArrays(displayJson, arrayKeys, originalData)}
      </Box>

      {/* Expanded array details */}
      {arrayKeys.map(arrayKey => (
        <Collapse key={arrayKey} in={expandedArrays[arrayKey]}>
          <Box sx={{ mt: 2 }}>
            <Paper elevation={1} sx={{ p: 2 }}>
              <ArrayDataTable 
                data={originalData?.[arrayKey] || []} 
                title={`${arrayKey} 상세 정보`} 
              />
            </Paper>
          </Box>
        </Collapse>
      ))}
    </Box>
  );
};

export default JsonDataDisplay;