import React, { useState, useEffect, useRef } from 'react';
import {
  Edit3, Mail, Phone, MapPin, Star, Lock, Store, Package,
  ShoppingCart, CreditCard, Shield, Loader, Camera, Upload
} from 'lucide-react';
import Button from './ui/Button';
import Card from './ui/Card';
import Input from './ui/Input';
import Textarea from './ui/Textarea';
import { Spinner } from './ui/Spinner';
import AvatarIniciales from './ui/AvatarIniciales';
import StarRating from './ui/StarRating';
import ModalQR from './ui/ModalQR';
import ChangePasswordModal from './ui/ChangePasswordModal';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import { useToast } from '../contexts/ToastContext';
import { supabase } from '../lib/supabase';
import { subirArchivo } from '../lib/storage';
import { useReviews } from '../hooks/useReviews';

// --- Interfaces ---
interface PerfilData {
  id: string;
  nombres: string;
  apellidos: string;
  ciudad?: string;
  avatar?: string;
  telefono?: string; // Agregado
  email?: string;
  descripcion?: string;
  qr_pago_1_url?: string;
  qr_pago_2_url?: string;
  calificacion_promedio?: number;
  total_reseñas?: number;
}

interface VistaPerfilUsuarioProps {
  userId: string;
  esPropioPerfil: boolean;
  esVendedor: boolean;
  isEditing: boolean;
  setIsEditing: (isEditing: boolean) => void;
  startIncomplete?: boolean;
}

function VistaPerfilUsuario({ 
  userId, 
  esPropioPerfil, 
  esVendedor, 
  isEditing, 
  setIsEditing,
  startIncomplete 
}: VistaPerfilUsuarioProps) {
  const { user: currentUser, updateProfile } = useSupabaseAuth();
  const toast = useToast();
  const [perfil, setPerfil] = useState<PerfilData | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalQR, setModalQR] = useState<{ isOpen: boolean, url: string, title: string }>({ isOpen: false, url: '', title: '' });
  const [isChangePasswordModalOpen, setChangePasswordModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editData, setEditData] = useState({ nombres: '', apellidos: '', ciudad: '', descripcion: '', telefono: '' }); // 'telefono' agregado aquí
  const [qr1File, setQr1File] = useState<File | null>(null);
  const [qr2File, setQr2File] = useState<File | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const { reviews } = useReviews(userId);

  useEffect(() => {
    if (startIncomplete) {
      setIsEditing(true);
    }
  }, [startIncomplete, setIsEditing]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) return;
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('perfiles')
          .select('*')
          .eq('id', userId)
          .single();
        if (error) throw error;
        setPerfil(data);
        setEditData({ 
          nombres: data.nombres, 
          apellidos: data.apellidos, 
          ciudad: data.ciudad || '',
          descripcion: data.descripcion || '',
          telefono: data.telefono || '' // 'telefono' inicializado aquí
        });
      } catch (err) {
        toast.error('Error al cargar el perfil.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [userId, toast]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length || !currentUser) return;
    const file = e.target.files[0];
    const ext = file.name.split('.').pop();
    const path = `${currentUser.id}/avatar.${ext}`;

    setIsSaving(true);
    try {
      const avatarUrl = await subirArchivo(file, 'avatares', path);
      await updateProfile({ avatar: avatarUrl });
      setPerfil(prev => prev ? { ...prev, avatar: avatarUrl } : null);
      toast.success('Foto de perfil actualizada');
    } catch (error: any) {
      toast.error(`Error al actualizar el perfil: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = async () => {
    if (!perfil || !currentUser) return;
    setIsSaving(true);
    
    const dataToUpdate: Partial<PerfilData> = {
        nombres: editData.nombres,
        apellidos: editData.apellidos,
        ciudad: editData.ciudad,
        telefono: editData.telefono, // Incluido el teléfono
    };

    if (esVendedor) {
        dataToUpdate.descripcion = editData.descripcion;
        try {
            if (qr1File) {
                const path = `${currentUser.id}/qr1.${qr1File.name.split('.').pop()}`;
                const url = await subirArchivo(qr1File, 'qrs_vendedores', path);
                dataToUpdate.qr_pago_1_url = url;
            }
            if (qr2File) {
                const path = `${currentUser.id}/qr2.${qr2File.name.split('.').pop()}`;
                const url = await subirArchivo(qr2File, 'qrs_vendedores', path);
                dataToUpdate.qr_pago_2_url = url;
            }
        } catch (error) {
            toast.error('Error al subir los códigos QR.');
            setIsSaving(false);
            return;
        }
    }

    const { error } = await updateProfile(dataToUpdate);
    
    if (error) {
        toast.error(error.message);
    } else {
      setPerfil(prev => prev ? { ...prev, ...dataToUpdate } : null);
      toast.success('Perfil actualizado con éxito');
      setIsEditing(false);
    }
    setIsSaving(false);
  };

  const openModalQR = (url: string, title: string) => setModalQR({ isOpen: true, url, title });
  const closeModalQR = () => setModalQR({ isOpen: false, url: '', title: '' });

  if (loading) return <Spinner message="Cargando perfil..." />;

  if (!perfil)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h2 className="text-2xl font-semibold">Perfil no encontrado</h2>
      </div>
    );

  return (
    <div className="bg-white p-4 sm:p-8 rounded-lg shadow-md">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-blue-600">Mi Perfil</h1>
        <p className="text-gray-600 mt-1">Gestiona tu información de cuenta y tus perfiles.</p>
      </div>

      <Card className="p-6 mb-8">
        <div className="flex flex-col sm:flex-row items-center sm:space-x-6">
          <div className="relative mb-4 sm:mb-0">
            <AvatarIniciales
              nombres={perfil.nombres}
              apellidos={perfil.apellidos}
              src={perfil.avatar}
              className="w-36 h-36 text-6xl border-4 border-white shadow-lg"
            />
            {esPropioPerfil && (
              <>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
                <Button
                  size="icon"
                  className="absolute bottom-1 right-1 rounded-full shadow-md"
                  onClick={() => avatarInputRef.current?.click()}
                >
                  {isSaving ? <Loader size={18} className="animate-spin" /> : <Camera size={18} />}
                </Button>
              </>
            )}
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-2xl font-bold">{perfil.nombres} {perfil.apellidos}</h2>
            <p className="text-gray-500 flex items-center justify-center sm:justify-start gap-2 mt-2">
              <MapPin size={16} /> {perfil.ciudad || 'Santa Cruz de la Sierra'}
            </p>
            <p className="text-gray-700 flex items-center justify-center sm:justify-start gap-2 mt-2">
              <Mail size={16} /> {perfil.email}
            </p>
            <p className="text-gray-700 flex items-center justify-center sm:justify-start gap-2 mt-1">
              <Phone size={16} /> {perfil.telefono || 'No especificado'}
            </p>
            <div className="flex items-center justify-center sm:justify-start gap-2 mt-3">
              <StarRating rating={perfil.calificacion_promedio || 0} size={20} />
              <span className="text-gray-600">({perfil.total_reseñas || 0} reseñas)</span>
            </div>
          </div>
        </div>
        {esPropioPerfil && (
          <div className="mt-6 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
            <Button onClick={() => setIsEditing(!isEditing)} variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
              <Edit3 size={16} className="mr-2" /> {isEditing ? 'Cancelar' : 'Editar Perfil'}
            </Button>
            <Button onClick={() => setChangePasswordModalOpen(true)} variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
              <Lock size={16} className="mr-2" /> Cambiar Contraseña
            </Button>
          </div>
        )}
      </Card>

      {isEditing && (
        <Card className="p-6 mb-8">
          <h3 className="text-xl font-semibold mb-4">Editar Información</h3>
          <div className="space-y-4">
            <Input label="Nombres" value={editData.nombres} onChange={e => setEditData({ ...editData, nombres: e.target.value })} />
            <Input label="Apellidos" value={editData.apellidos} onChange={e => setEditData({ ...editData, apellidos: e.target.value })} />
            <Input label="Ciudad / Ubicación" value={editData.ciudad} onChange={e => setEditData({ ...editData, ciudad: e.target.value })} />
            <Input label="Número de Teléfono" value={editData.telefono} onChange={e => setEditData({ ...editData, telefono: e.target.value })} /> {/* Nuevo campo de teléfono */}
            {esVendedor && (
              <>
                <Textarea
                  label="Descripción de la tienda"
                  value={editData.descripcion}
                  onChange={e => setEditData({ ...editData, descripcion: e.target.value })}
                  placeholder="Describe tu tienda, qué vendes, etc."
                  rows={4}
                />
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">QR de Pago 1</label>
                    <div className="flex items-center space-x-3">
                        {perfil.qr_pago_1_url && !qr1File && <img src={perfil.qr_pago_1_url} className="w-16 h-16 rounded"/>}
                        <Input type="file" accept="image/*" onChange={e => setQr1File(e.target.files ? e.target.files[0] : null)} />
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">QR de Pago 2</label>
                     <div className="flex items-center space-x-3">
                        {perfil.qr_pago_2_url && !qr2File && <img src={perfil.qr_pago_2_url} className="w-16 h-16 rounded"/>}
                        <Input type="file" accept="image/*" onChange={e => setQr2File(e.target.files ? e.target.files[0] : null)} />
                    </div>
                </div>
              </>
            )}
            <div className="flex space-x-3 pt-4">
                <Button onClick={handleSave} variant="primary" disabled={isSaving}>
                  {isSaving ? <><Loader className="animate-spin mr-2"/> Guardando...</> : 'Guardar Cambios'}
                </Button>
                <Button onClick={() => setIsEditing(false)} variant="ghost" disabled={isSaving}>
                    Cancelar
                </Button>
            </div>
          </div>
        </Card>
      )}

      {esVendedor && !isEditing && (
        <div>
          <h2 className="text-2xl font-bold text-blue-600 mb-4">Mi Panel de Vendedor</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-2">Sobre el Vendedor</h3>
              <p>{perfil.descripcion || 'No has añadido una descripción todavía.'}</p>
            </Card>
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-2">Métodos de Pago</h3>
              <div className="flex space-x-4">
                <div className="text-center cursor-pointer" onClick={() => openModalQR(perfil.qr_pago_1_url || '', 'QR Principal')}>
                  {perfil.qr_pago_1_url ? <img src={perfil.qr_pago_1_url} alt="QR Principal" className="w-24 h-24 rounded-lg" /> : <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center">QR 1</div>}
                  <p className="mt-2 font-semibold">QR Principal</p>
                </div>
                <div className="text-center cursor-pointer" onClick={() => openModalQR(perfil.qr_pago_2_url || '', 'QR Secundario')}>
                  {perfil.qr_pago_2_url ? <img src={perfil.qr_pago_2_url} alt="QR Secundario" className="w-24 h-24 rounded-lg" /> : <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center">QR 2</div>}
                  <p className="mt-2 font-semibold">QR Secundario</p>
                </div>
              </div>
            </Card>
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-2">Panel de Control</h3>
              <div className="space-y-2">
                <a href="/mis-productos" className="flex items-center space-x-2 text-blue-600 hover:underline">
                  <Package size={20} />
                  <span>Gestionar Productos</span>
                </a>
                <a href="/gestion-ventas" className="flex items-center space-x-2 text-blue-600 hover:underline">
                  <ShoppingCart size={20} />
                  <span>Gestionar Ventas</span>
                </a>
              </div>
            </Card>
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-2">Reseñas Recibidas</h3>
              {reviews.length === 0 ? (
                <p className="text-gray-500">Este usuario aún no tiene reseñas.</p>
              ) : (
                <div className="space-y-4">
                  {reviews.map(r => (
                    <div key={r.id} className="border-b pb-2">
                      <p className="font-semibold">{r.comentario}</p>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      )}

      <ModalQR isOpen={modalQR.isOpen} onClose={closeModalQR} qrUrl={modalQR.url} title={modalQR.title} />
      <ChangePasswordModal isOpen={isChangePasswordModalOpen} onClose={() => setChangePasswordModalOpen(false)} />
    </div>
  );
}

export default VistaPerfilUsuario;
