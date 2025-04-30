import React from 'react';
import { MapPin, Calendar, ExternalLink } from 'lucide-react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Button from '../common/Button';
import { Item } from '../../types';
import { formatDate } from '../../utils/formatDate';

interface ItemCardProps {
  item: Item;
  onClick?: () => void;
  showActions?: boolean;
  selected?: boolean;
}

const ItemCard: React.FC<ItemCardProps> = ({ 
  item, 
  onClick,
  showActions = true,
  selected = false,
}) => {
  const getBadgeVariant = (status: Item['status']) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'matched': return 'success';
      case 'completed': return 'primary';
      default: return 'gray';
    }
  };

  const getTypeVariant = (type: Item['type']) => {
    return type === 'lost' ? 'error' : 'primary';
  };

  return (
    <Card 
      hover
      className={`
        transition-all duration-200
        ${selected ? 'ring-2 ring-primary-500' : ''}
      `}
    >
      <div className="flex flex-col h-full">
        <div className="flex justify-between items-start mb-3">
          <div>
            <Badge variant={getTypeVariant(item.type)}>
              {item.type === 'lost' ? 'Lost' : 'Found'}
            </Badge>
            <span className="ml-2">
              <Badge variant={getBadgeVariant(item.status)}>
                {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
              </Badge>
            </span>
          </div>
          <Badge variant="gray">{item.category}</Badge>
        </div>
        
        {item.image_url && (
          <div className="relative mb-3 aspect-[4/3] overflow-hidden rounded-md">
            <img 
              src={item.image_url} 
              alt={item.title}
              className="object-cover w-full h-full"
            />
          </div>
        )}

        <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
        
        <p className="text-sm text-gray-600 line-clamp-2 mb-3">{item.description}</p>
        
        <div className="mt-auto">
          <div className="flex items-center text-xs text-gray-500 mb-1">
            <MapPin className="w-3.5 h-3.5 mr-1" />
            <span>{item.location}</span>
          </div>
          
          <div className="flex items-center text-xs text-gray-500 mb-3">
            <Calendar className="w-3.5 h-3.5 mr-1" />
            <span>{formatDate(new Date(item.created_at))}</span>
          </div>
          
          {showActions && (
            <Button
              variant="primary"
              size="sm"
              className="w-full"
              onClick={onClick}
            >
              View Details
              <ExternalLink className="ml-1 w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

export default ItemCard;