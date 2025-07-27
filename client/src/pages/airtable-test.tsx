import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface TestResult {
  tableName: string;
  success: boolean;
  records?: number;
  data?: any;
  error?: string;
  status?: number;
}

export default function AirtableTest() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(false);

  const testTable = async (tableName: string, endpoint: string) => {
    try {
      const response = await fetch(`/api/test/${endpoint}`);
      const data = await response.json();
      
      return {
        tableName: data.tableName || tableName,
        success: data.success,
        records: data.records,
        data: data.data,
        error: data.error,
        status: data.status
      };
    } catch (error) {
      return {
        tableName,
        success: false,
        error: error.message
      };
    }
  };

  const runAllTests = async () => {
    setLoading(true);
    setResults([]);
    
    // First get table metadata
    try {
      const metaResponse = await fetch('/api/test/tables');
      const metaData = await metaResponse.json();
      
      if (metaData.success) {
        console.log('Available tables:', metaData.tables);
        
        // Filter for our target tables
        const targetTables = metaData.tables.filter(table => 
          ['Drivers', 'Volunteer Applications', 'V Availability', 'V Shift Assignment'].includes(table.name)
        );
        
        const testResults = [];
        for (const table of targetTables) {
          const result = await testDirectTable(table.name, table.id);
          testResults.push(result);
          setResults([...testResults]);
        }
      } else {
        // Fallback to original method
        const tests = [
          { name: 'Drivers', endpoint: 'drivers' },
          { name: 'Volunteer Applications', endpoint: 'volunteers' },
          { name: 'V Availability', endpoint: 'availability' },
          { name: 'V Shift Assignment', endpoint: 'assignments' }
        ];
        
        const testResults = [];
        for (const test of tests) {
          const result = await testTable(test.name, test.endpoint);
          testResults.push(result);
          setResults([...testResults]);
        }
      }
    } catch (error) {
      console.error('Error getting table metadata:', error);
    }
    
    setLoading(false);
  };

  const testDirectTable = async (tableName: string, tableId: string) => {
    try {
      const response = await fetch(`/api/test/direct/${encodeURIComponent(tableName)}`);
      const data = await response.json();
      
      return {
        tableName,
        success: data.success,
        records: data.records,
        data: data.data,
        error: data.error,
        status: data.status
      };
    } catch (error) {
      return {
        tableName,
        success: false,
        error: error.message
      };
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-xl font-semibold mb-4">Airtable Schema Test</h2>
        <Button onClick={runAllTests} disabled={loading}>
          {loading ? 'Testing...' : 'Test All Airtable Tables'}
        </Button>
      </div>

      {results.map((result, index) => (
        <div key={index} className={`bg-white rounded-lg border p-6 ${result.success ? 'border-green-500' : 'border-red-500'}`}>
          <h3 className={`text-lg font-semibold mb-3 ${result.success ? 'text-green-700' : 'text-red-700'}`}>
            {result.success ? '✅' : '❌'} {result.tableName}
          </h3>
          <div>
            {result.success ? (
              <div className="space-y-2">
                <p><strong>Records found:</strong> {result.records}</p>
                {result.data && result.data.length > 0 && (
                  <details>
                    <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                      View sample data
                    </summary>
                    <pre className="mt-2 bg-gray-100 p-3 rounded text-sm overflow-auto">
                      {JSON.stringify(result.data[0]?.fields || {}, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ) : (
              <div className="text-red-600">
                <p><strong>Error:</strong> {result.error}</p>
                {result.status && <p><strong>Status:</strong> {result.status}</p>}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}