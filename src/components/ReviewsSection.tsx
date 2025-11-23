import React, { useState } from 'react';
import { useReviews, Review } from '../hooks/useReviews';
import { Card, Button } from './ui';
import { Spinner } from './ui/Spinner';
import AvatarIniciales from './ui/AvatarIniciales';
import StarRating from './ui/StarRating';
import ReviewForm from './ui/ReviewForm';
import { ToastActions, User } from '../types/product';
import { Edit } from 'lucide-react';

const ReviewCard = ({ review }: { review: Review }) => (
  <div className="p-4 border-b last:border-b-0">
    <div className="flex items-start gap-4">
      <AvatarIniciales src={review.comprador?.avatar} nombres={review.comprador?.nombres || 'U'} apellidos={review.comprador?.apellidos || 'D'} className="w-10 h-10 text-sm"/>
      <div className="flex-1">
        <div className="flex justify-between items-center">
          <p className="font-bold text-gray-800">{`${review.comprador?.nombres || ''} ${review.comprador?.apellidos || ''}`.trim()}</p>
          <span className="text-xs text-gray-500">{new Date(review.fecha_creacion).toLocaleDateString('es-BO')}</span>
        </div>
        <StarRating rating={review.calificacion || 0} size={16} showText={false} className="my-1" />
        <p className="text-gray-700 text-sm">{review.comentario || ''}</p>
      </div>
    </div>
  </div>
);

interface ReviewsSectionProps {
  userId: string;
  esPropioPerfil: boolean;
  currentUser: User | null;
  toast: ToastActions;
}

function ReviewsSection({ userId, esPropioPerfil, currentUser, toast }: ReviewsSectionProps) {
  const { reviews, loading: reviewsLoading, refetch } = useReviews(userId);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const handleReviewSubmitted = () => {
    refetch(); // Recarga las reseñas
    setIsReviewModalOpen(false); // Cierra el modal
  };

  return (
    <>
      <Card padding="none">
        <div className="p-6 border-b flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-800">Reseñas Recibidas</h3>
          {!esPropioPerfil && currentUser && (
            <Button variant="outline" icon={Edit} onClick={() => setIsReviewModalOpen(true)}>
              Escribir una reseña
            </Button>
          )}
        </div>
        {reviewsLoading ? (
          <Spinner message="Cargando reseñas..." />
        ) : reviews.length > 0 ? (
          <div>
            {reviews.map(r => <ReviewCard key={r.id} review={r} />)}
          </div>
        ) : (
          <p className="p-6 text-center text-gray-500">Este usuario aún no tiene reseñas.</p>
        )}
      </Card>

      <ReviewForm
        vendedorId={userId}
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        onReviewSubmitted={handleReviewSubmitted}
        toast={toast}
        user={currentUser}
      />
    </>
  );
}

export default ReviewsSection;
