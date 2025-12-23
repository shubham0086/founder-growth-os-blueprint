import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/safeClient';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import { seedWorkspaceData } from '@/lib/seedWorkspaceData';

export interface Workspace {
  id: string;
  name: string;
  industry: string | null;
  region: string | null;
  currency: string;
  timezone: string;
  created_at: string;
}

interface WorkspaceContextType {
  workspace: Workspace | null;
  workspaces: Workspace[];
  isLoading: boolean;
  setCurrentWorkspace: (workspace: Workspace) => void;
  createWorkspace: (name: string, industry?: string) => Promise<Workspace | null>;
  refreshWorkspaces: () => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const refreshWorkspaces = async () => {
    if (!user) {
      setWorkspaces([]);
      setWorkspace(null);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('workspaces')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Auto-create default workspace if none exists
      if (!data || data.length === 0) {
        const { data: newWorkspace, error: createError } = await supabase
          .from('workspaces')
          .insert({
            user_id: user.id,
            name: 'My Workspace',
            industry: 'General',
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating default workspace:', createError);
        } else if (newWorkspace) {
          setWorkspaces([newWorkspace]);
          setWorkspace(newWorkspace);
          // Seed sample data for the new workspace
          await seedWorkspaceData(newWorkspace.id);
          toast({
            title: 'Welcome!',
            description: 'Your workspace has been created with sample data.',
          });
        }
      } else {
        setWorkspaces(data);
        if (!workspace) {
          setWorkspace(data[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching workspaces:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshWorkspaces();
  }, [user]);

  const setCurrentWorkspace = (ws: Workspace) => {
    setWorkspace(ws);
  };

  const createWorkspace = async (name: string, industry?: string): Promise<Workspace | null> => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('workspaces')
        .insert({
          user_id: user.id,
          name,
          industry,
        })
        .select()
        .single();

      if (error) throw error;

      setWorkspaces(prev => [data, ...prev]);
      setWorkspace(data);
      
      toast({
        title: 'Workspace Created',
        description: `"${name}" is ready to use.`,
      });

      return data;
    } catch (error) {
      console.error('Error creating workspace:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to create workspace.',
      });
      return null;
    }
  };

  return (
    <WorkspaceContext.Provider value={{
      workspace,
      workspaces,
      isLoading,
      setCurrentWorkspace,
      createWorkspace,
      refreshWorkspaces,
    }}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
}
