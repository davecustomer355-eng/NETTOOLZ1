import { supabase } from '../supabase';
import { Product, User, SiteSettings, AdminUser } from '../types';

export class DatabaseService {
  async init(): Promise<boolean> {
    console.log('Initializing Supabase connection...');
    try {
      const { data, error } = await supabase.from('settings').select('*').limit(1);
      if (error) throw error;
      console.log('Supabase Connection Verified Successfully.');
      return true;
    } catch (err) {
      console.warn('Supabase initialization check failed:', err);
      return false;
    }
  }

  // Products
  async getAllProducts(): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*');
      
      if (error) throw error;
      return (data || []) as Product[];
    } catch (err) {
      console.error('Error fetching products:', err);
      return [];
    }
  }

  async saveProducts(products: Product[]): Promise<void> {
    try {
      const { error } = await supabase
        .from('products')
        .upsert(products);
      
      if (error) throw error;
    } catch (err) {
      console.error('Error saving products:', err);
    }
  }

  // Users
  async getAllUsers(): Promise<User[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*');
      
      if (error) throw error;
      return (data || []) as User[];
    } catch (err) {
      console.error('Error fetching users:', err);
      return [];
    }
  }

  async saveUser(user: User): Promise<void> {
    try {
      const { error } = await supabase
        .from('users')
        .upsert(user);
      
      if (error) throw error;
    } catch (err) {
      console.error('Error saving user:', err);
    }
  }

  // Settings
  async getSettings(): Promise<SiteSettings | null> {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('config')
        .eq('id', 'main_config')
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw error;
      }
      return data.config as SiteSettings;
    } catch (err) {
      console.error('Error fetching settings:', err);
      return null;
    }
  }

  async saveSettings(settings: SiteSettings): Promise<void> {
    try {
      const { error } = await supabase
        .from('settings')
        .upsert({ id: 'main_config', config: settings });
      
      if (error) throw error;
    } catch (err) {
      console.error('Error saving settings:', err);
    }
  }

  // Storage
  async uploadProductImage(file: File): Promise<string | null> {
    try {
      // Ensure bucket exists (best effort)
      await supabase.storage.createBucket('products', { public: true }).catch(() => {});

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('products')
        .getPublicUrl(fileName);

      return data.publicUrl;
    } catch (err) {
      console.error('Error uploading product image:', err);
      return null;
    }
  }

  // Admins
  async getAllAdmins(): Promise<AdminUser[]> {
    try {
      const { data, error } = await supabase
        .from('admins')
        .select('*');
      
      if (error) throw error;
      return (data || []) as AdminUser[];
    } catch (err) {
      console.error('Error fetching admins:', err);
      return [];
    }
  }

  async saveAdmins(admins: AdminUser[]): Promise<void> {
    try {
      const { error } = await supabase
        .from('admins')
        .upsert(admins);
      
      if (error) throw error;
    } catch (err) {
      console.error('Error saving admins:', err);
    }
  }
}

export const dbService = new DatabaseService();
