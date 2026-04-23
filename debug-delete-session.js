// Debug script to test delete session endpoint
// Run this in browser console when logged in

async function testDeleteSession(sessionId) {
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('access_token');

  if (!user || !token) {
    console.error('User not logged in');
    return;
  }

  const baseUrl = 'http://localhost:8000';
  const url = `${baseUrl}/student/${user.id}/chat-sessions/${sessionId}`;

  console.log('Testing DELETE endpoint:');
  console.log('URL:', url);
  console.log('User ID:', user.id);
  console.log('Session ID:', sessionId);
  console.log('Token:', token.substring(0, 20) + '...');

  try {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': true
      }
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', [...response.headers.entries()]);

    const data = await response.json();
    console.log('Response data:', data);

    if (response.ok) {
      console.log('✅ Session deleted successfully');
    } else {
      console.log('❌ Delete failed');
    }
  } catch (error) {
    console.error('Network error:', error);
  }
}

// Usage: testDeleteSession('your-session-id-here');
console.log('Delete session test function loaded. Use: testDeleteSession("session-id")');
