
import { useAuth } from './authContext';

interface TicketCreationParams {
  category: string;
  title: string;
  description: string;
  priority: string;
  attachment?: File;
}

interface TicketReplyParams {
  ticketId: number;
  message: string;
}

export async function createTicket(params: TicketCreationParams) {
  const formData = new FormData();
  formData.append('category', params.category);
  formData.append('title', params.title);
  formData.append('description', params.description);
  formData.append('priority', params.priority);
  
  if (params.attachment) {
    formData.append('attachment', params.attachment);
  }
  
  try {
    const response = await fetch('/api/support/tickets', {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create ticket');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating ticket:', error);
    throw error;
  }
}

export async function getAllTickets() {
  try {
    const response = await fetch('/api/support/tickets', {
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch tickets');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching tickets:', error);
    throw error;
  }
}

export async function getTicketById(ticketId: number) {
  try {
    const response = await fetch(`/api/support/tickets/${ticketId}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch ticket details');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching ticket details:', error);
    throw error;
  }
}

export async function addTicketReply(params: TicketReplyParams) {
  try {
    const response = await fetch(`/api/support/tickets/${params.ticketId}/replies`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: params.message }),
      credentials: 'include',
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to add reply');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error adding reply:', error);
    throw error;
  }
}

export async function processAIChatMessage(message: string) {
  try {
    const response = await fetch('/api/support/ai-chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
      credentials: 'include',
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to process AI message');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error processing AI message:', error);
    throw error;
  }
}

export async function getAdminTickets() {
  try {
    const response = await fetch('/api/admin/support/tickets', {
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch admin tickets');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching admin tickets:', error);
    throw error;
  }
}

export async function updateTicketStatus(ticketId: number, status: string) {
  try {
    const response = await fetch(`/api/admin/support/tickets/${ticketId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
      credentials: 'include',
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update ticket status');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating ticket status:', error);
    throw error;
  }
}

export async function getActiveSupportAgents() {
  try {
    const response = await fetch('/api/support/active-agents', {
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch active agents');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching active agents:', error);
    throw error;
  }
}
