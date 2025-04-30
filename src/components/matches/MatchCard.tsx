import React from 'react';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Button from '../common/Button';
import { Match, Item } from '../../types';
import { formatDate } from '../../utils/formatDate';

interface MatchCardProps {
  match: Match;
  lostItem: Item;
  foundItem: Item;
  onApprove?: () => void;
  onReject?: () => void;
  isAdminView?: boolean;
}

const MatchCard: React.FC<MatchCardProps> = ({ 
  match, 
  lostItem, 
  foundItem, 
  onApprove, 
  onReject,
  isAdminView = false,
}) => {
  const confidencePercent = Math.round(match.match_confidence * 100);
  
  const getConfidenceBadgeVariant = (confidence: number) => {
    if (confidence >= 0.9) return 'success';
    if (confidence >= 0.8) return 'primary';
    return 'warning';
  };

  const getStatusBadgeVariant = (status: Match['status']) => {
    switch (status) {
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'pending': return 'warning';
      default: return 'gray';
    }
  };

  return (
    <Card className="animate-fade-in">
      <div className="flex justify-between items-start mb-4">
        <h3 className="font-semibold text-lg text-gray-900">Potential Match</h3>
        <div className="flex space-x-2">
          <Badge variant={getConfidenceBadgeVariant(match.match_confidence)}>
            {confidencePercent}% Match
          </Badge>
          <Badge variant={getStatusBadgeVariant(match.status)}>
            {match.status.charAt(0).toUpperCase() + match.status.slice(1)}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="border border-gray-200 rounded-md p-3">
          <div className="flex justify-between items-start mb-2">
            <Badge variant="error">Lost Item</Badge>
            <span className="text-sm text-gray-500">{formatDate(new Date(lostItem.created_at))}</span>
          </div>
          
          {lostItem.image_url && (
            <div className="aspect-[4/3] overflow-hidden rounded-md mb-2">
              <img 
                src={lostItem.image_url} 
                alt={lostItem.title}
                className="object-cover w-full h-full"
              />
            </div>
          )}
          
          <h4 className="font-medium text-gray-900">{lostItem.title}</h4>
          <p className="text-sm text-gray-600 line-clamp-2 mt-1">{lostItem.description}</p>
          <p className="text-xs text-gray-500 mt-2">{lostItem.location}</p>
        </div>
        
        <div className="border border-gray-200 rounded-md p-3">
          <div className="flex justify-between items-start mb-2">
            <Badge variant="primary">Found Item</Badge>
            <span className="text-sm text-gray-500">{formatDate(new Date(foundItem.created_at))}</span>
          </div>
          
          {foundItem.image_url && (
            <div className="aspect-[4/3] overflow-hidden rounded-md mb-2">
              <img 
                src={foundItem.image_url} 
                alt={foundItem.title}
                className="object-cover w-full h-full"
              />
            </div>
          )}
          
          <h4 className="font-medium text-gray-900">{foundItem.title}</h4>
          <p className="text-sm text-gray-600 line-clamp-2 mt-1">{foundItem.description}</p>
          <p className="text-xs text-gray-500 mt-2">{foundItem.location}</p>
        </div>
      </div>

      {match.admin_notes && (
        <div className="mb-4 p-3 bg-gray-50 rounded-md">
          <p className="text-sm font-medium text-gray-700">Admin Notes:</p>
          <p className="text-sm text-gray-600 mt-1">{match.admin_notes}</p>
        </div>
      )}

      {isAdminView && match.status === 'pending' && (
        <div className="flex justify-end space-x-2 mt-4">
          <Button
            variant="danger"
            size="sm"
            onClick={onReject}
          >
            <XCircle className="w-4 h-4 mr-1" />
            Reject Match
          </Button>
          <Button
            variant="success"
            size="sm"
            onClick={onApprove}
          >
            <CheckCircle className="w-4 h-4 mr-1" />
            Approve Match
          </Button>
        </div>
      )}
      
      {!isAdminView && match.status === 'pending' && (
        <div className="flex items-center p-3 bg-warning-50 border border-warning-200 rounded-md mt-4">
          <AlertCircle className="w-5 h-5 text-warning-500 mr-2" />
          <p className="text-sm text-warning-700">
            This match is currently being reviewed by an administrator.
          </p>
        </div>
      )}
    </Card>
  );
};

export default MatchCard;