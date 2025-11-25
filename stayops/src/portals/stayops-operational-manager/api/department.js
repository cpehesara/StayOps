const API_BASE_URL = 'http://localhost:8080/api/departments';

// Cache the working endpoint to avoid retrying failed ones
let workingEndpoint = null;

export const departmentAPI = {
  /**
   * Fetch all departments
   */
  getAllDepartments: async () => {
    try {
      // If we know which endpoint works, use it directly
      if (workingEndpoint) {
        console.log(`Using cached working endpoint: ${workingEndpoint}`);
        const response = await fetch(workingEndpoint);
        if (response.ok) {
          return response.json();
        }
        // If cached endpoint fails, reset and try all endpoints again
        console.log(`Cached endpoint failed, resetting cache`);
        workingEndpoint = null;
      }

      // Try multiple possible endpoints
      const endpoints = [
        `${API_BASE_URL}/getAll`, // Try this first since it worked in logs
        `${API_BASE_URL}`,
        `${API_BASE_URL}/all`
      ];
      
      let lastError;
      for (const endpoint of endpoints) {
        try {
          console.log(`Trying endpoint: ${endpoint}`);
          const response = await fetch(endpoint);
          if (response.ok) {
            workingEndpoint = endpoint; // Cache the working endpoint
            console.log(`✅ Success! Caching endpoint: ${endpoint}`);
            return response.json();
          }
          console.log(`❌ Endpoint ${endpoint} failed with status: ${response.status}`);
        } catch (error) {
          console.log(`❌ Endpoint ${endpoint} failed with error:`, error.message);
          lastError = error;
        }
      }
      
      // If all endpoints fail, throw the last error
      throw lastError || new Error('All department endpoints failed');
    } catch (error) {
      console.error('getAllDepartments error:', error);
      throw error;
    }
  },

  /**
   * Fetch a single department by ID
   */
  getDepartmentById: async (departmentId) => {
    try {
      // Try multiple possible endpoints
      const endpoints = [
        `${API_BASE_URL}/get/${departmentId}`, // Try action-based first since getAll works
        `${API_BASE_URL}/${departmentId}`,
        `${API_BASE_URL}/get?id=${departmentId}`
      ];
      
      let lastError;
      for (const endpoint of endpoints) {
        try {
          console.log(`Trying endpoint: ${endpoint}`);
          const response = await fetch(endpoint);
          if (response.ok) {
            console.log(`✅ getDepartmentById success with: ${endpoint}`);
            return response.json();
          }
          console.log(`❌ Endpoint ${endpoint} failed with status: ${response.status}`);
        } catch (error) {
          console.log(`❌ Endpoint ${endpoint} failed with error:`, error.message);
          lastError = error;
        }
      }
      
      throw lastError || new Error('All department endpoints failed');
    } catch (error) {
      console.error('getDepartmentById error:', error);
      throw error;
    }
  },

  /**
   * Create a new department
   */
  createDepartment: async (departmentData) => {
    try {
      console.log('Sending POST request to:', `${API_BASE_URL}/create`);
      console.log('Request payload:', JSON.stringify(departmentData, null, 2));

      // Ensure all required fields are present and properly formatted
      const requestData = {
        name: departmentData.name,
        description: departmentData.description || null,
        headOfDepartment: departmentData.headOfDepartment || null,
        email: departmentData.email || null,
        phone: departmentData.phone || null,
        location: departmentData.location || null,
        workingHours: departmentData.workingHours || null,
        status: departmentData.status || 'ACTIVE',
        performance: departmentData.performance || 0,
        hotelId: departmentData.hotelId || 1 // This should be dynamic
      };

      const response = await fetch(`${API_BASE_URL}/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`;
        try {
          const errorText = await response.text();
          console.error('Backend error response:', errorText);
          
          try {
            const errorJson = JSON.parse(errorText);
            errorMessage = errorJson.message || errorJson.error || errorText;
          } catch {
            errorMessage = errorText || errorMessage;
          }
        } catch {
          console.error('Could not read error response:');
        }
        
        throw new Error(`Failed to create department: ${errorMessage}`);
      }
      
      const result = await response.json();
      console.log('Create successful:', result);
      return result;
    } catch (error) {
      console.error('createDepartment error:', error);
      throw error;
    }
  },

  /**
   * Update an existing department
   */
  updateDepartment: async (departmentId, departmentData) => {
    try {
      console.log(`Sending PUT request to: ${API_BASE_URL}/update/${departmentId}`);
      console.log('Request payload:', JSON.stringify(departmentData, null, 2));
      
      // Ensure all fields are properly formatted for the DTO
      const requestData = {
        name: departmentData.name,
        description: departmentData.description || null,
        headOfDepartment: departmentData.headOfDepartment || null,
        email: departmentData.email || null,
        phone: departmentData.phone || null,
        location: departmentData.location || null,
        workingHours: departmentData.workingHours || null,
        status: departmentData.status || 'ACTIVE',
        performance: departmentData.performance || 0,
        hotelId: departmentData.hotelId || 1 // This should be dynamic
      };
      
      const response = await fetch(`${API_BASE_URL}/update/${departmentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`;
        try {
          const errorText = await response.text();
          console.error('Backend error response:', errorText);
          
          try {
            const errorJson = JSON.parse(errorText);
            errorMessage = errorJson.message || errorJson.error || errorText;
          } catch {
            errorMessage = errorText || errorMessage;
          }
        } catch {
          console.error('Could not read error response:');
        }
        
        throw new Error(`Failed to update department: ${errorMessage}`);
      }
      
      const result = await response.json();
      console.log('✅ Update successful:', result);
      return result;
    } catch (error) {
      console.error('updateDepartment error:', error);
      throw error;
    }
  },

  /**
   * Delete a department by ID
   */
  deleteDepartment: async (departmentId) => {
    try {
      console.log(`Sending DELETE request to: ${API_BASE_URL}/delete/${departmentId}`);
      
      const response = await fetch(`${API_BASE_URL}/delete/${departmentId}`, {
        method: 'DELETE'
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`;
        try {
          const errorText = await response.text();
          console.error('Backend error response:', errorText);
          
          try {
            const errorJson = JSON.parse(errorText);
            errorMessage = errorJson.message || errorJson.error || errorText;
          } catch {
            errorMessage = errorText || errorMessage;
          }
        } catch {
          console.error('Could not read error response:');
        }
        
        throw new Error(`Failed to delete department: ${errorMessage}`);
      }
      
      console.log('Delete successful');
      return true;
    } catch (error) {
      console.error('deleteDepartment error:', error);
      throw error;
    }
  }
};