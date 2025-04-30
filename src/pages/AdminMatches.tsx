import React, { useState } from 'react';
import { useItems } from '../contexts/ItemContext';
import { useMatches } from '../contexts/MatchContext';
import Card from '../components/common/Card';
import MatchCard from '../components/matches/MatchCard';
import Button from '../components/common/Button';
import Textarea from '../components/common/Textarea';
import { X, AlertCircle } from 'lucide-react';
import { Match } from '../types';

const AdminMatches: React.FC = () => {
  const { items } = useItems();
  const { matches, updateMatchStatus, isLoading } = useMatches();
  const [showAdminNotes, setShowAdminNotes] = useState(false);
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);

  // Filter matches where both lost and found item still exist
  const validMatches = matches.filter(
    (m) =>
      items.some((i) => i.id === m.lost_item) &&
      items.some((i) => i.id === m.found_item)
  );

  const pendingMatches = validMatches.filter(m => m.status === 'pending');
  const approvedMatches = validMatches.filter(m => m.status === 'approved');
  const rejectedMatches = validMatches.filter(m => m.status === 'rejected');

  const getItemsForMatch = (match: Match) => {
    const lostItem = items.find(item => item.id === match.lost_item);
    const foundItem = items.find(item => item.id === match.found_item);
    return { lostItem, foundItem };
  };

  const handleApproveMatch = (matchId: string) => {
    setSelectedMatchId(matchId);
    setAction('approve');
    setShowAdminNotes(true);
  };

  const handleRejectMatch = (matchId: string) => {
    setSelectedMatchId(matchId);
    setAction('reject');
    setShowAdminNotes(true);
  };

  const handleSubmitAction = async () => {
    if (!selectedMatchId || !action) return;
    try {
      await updateMatchStatus(
        selectedMatchId,
        action === 'approve' ? 'approved' : 'rejected',
        adminNotes || undefined
      );
      setShowAdminNotes(false);
      setSelectedMatchId(null);
      setAdminNotes('');
      setAction(null);
    } catch (err) {
      console.error('Error updating match:', err);
    }
  };

  const cancelAction = () => {
    setShowAdminNotes(false);
    setSelectedMatchId(null);
    setAdminNotes('');
    setAction(null);
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Review Matches</h1>
        <p className="mt-1 text-gray-600">
          Manage and approve potential matches between lost and found items
        </p>
      </div>

      {/* Pending */}
      {pendingMatches.length === 0 ? (
        <Card>
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Matches</h3>
            <p className="text-gray-600 max-w-md">
              There are no matches awaiting review. Approved and rejected matches are shown below.
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900">Pending Matches ({pendingMatches.length})</h2>
          {pendingMatches.map(match => {
            const { lostItem, foundItem } = getItemsForMatch(match);
            if (!lostItem || !foundItem) return null;
            return (
              <MatchCard
                key={match.id}
                match={match}
                lostItem={lostItem}
                foundItem={foundItem}
                onApprove={() => handleApproveMatch(match.id)}
                onReject={() => handleRejectMatch(match.id)}
                isAdminView
              />
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showAdminNotes && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 m-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {action === 'approve' ? 'Approve Match' : 'Reject Match'}
              </h3>
              <button onClick={cancelAction} className="text-gray-400 hover:text-gray-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            <Textarea
              label="Admin Notes (optional)"
              placeholder="Add notes about this decision"
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
            />
            <div className="flex justify-end space-x-2 mt-4">
              <Button variant="ghost" onClick={cancelAction}>Cancel</Button>
              <Button
                variant={action === 'approve' ? 'success' : 'danger'}
                onClick={handleSubmitAction}
                isLoading={isLoading}
              >
                {action === 'approve' ? 'Approve Match' : 'Reject Match'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Approved */}
      {approvedMatches.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Approved Matches</h2>
          <div className="space-y-6">
            {approvedMatches
              .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
              .slice(0, 3)
              .map(match => {
                const { lostItem, foundItem } = getItemsForMatch(match);
                if (!lostItem || !foundItem) return null;
                return (
                  <MatchCard
                    key={match.id}
                    match={match}
                    lostItem={lostItem}
                    foundItem={foundItem}
                    isAdminView
                  />
                );
              })}
          </div>
        </div>
      )}

      {/* Rejected */}
      {rejectedMatches.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Rejected Matches</h2>
          <div className="space-y-6">
            {rejectedMatches
              .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
              .slice(0, 3)
              .map(match => {
                const { lostItem, foundItem } = getItemsForMatch(match);
                if (!lostItem || !foundItem) return null;
                return (
                  <MatchCard
                    key={match.id}
                    match={match}
                    lostItem={lostItem}
                    foundItem={foundItem}
                    isAdminView
                  />
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMatches;
