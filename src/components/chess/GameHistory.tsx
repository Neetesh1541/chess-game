import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Trophy, Clock, Target, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface GameHistoryItem {
  id: string;
  status: string;
  result: string | null;
  winner_id: string | null;
  white_player_id: string | null;
  black_player_id: string | null;
  time_control: number | null;
  created_at: string;
  completed_at: string | null;
  white_profile?: { username: string; display_name: string | null };
  black_profile?: { username: string; display_name: string | null };
}

interface GameHistoryProps {
  userId: string;
}

const GameHistory: React.FC<GameHistoryProps> = ({ userId }) => {
  const [games, setGames] = useState<GameHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const fetchGames = async () => {
      const { data, error } = await supabase
        .from('online_games')
        .select(`
          id,
          status,
          result,
          winner_id,
          white_player_id,
          black_player_id,
          time_control,
          created_at,
          completed_at
        `)
        .or(`white_player_id.eq.${userId},black_player_id.eq.${userId}`)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error fetching game history:', error);
        setLoading(false);
        return;
      }

      // Fetch profiles for all players
      const playerIds = new Set<string>();
      data?.forEach(game => {
        if (game.white_player_id) playerIds.add(game.white_player_id);
        if (game.black_player_id) playerIds.add(game.black_player_id);
      });

      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, username, display_name')
        .in('user_id', Array.from(playerIds));

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

      const gamesWithProfiles = data?.map(game => ({
        ...game,
        white_profile: game.white_player_id ? profileMap.get(game.white_player_id) : undefined,
        black_profile: game.black_player_id ? profileMap.get(game.black_player_id) : undefined,
      })) || [];

      setGames(gamesWithProfiles);
      setLoading(false);
    };

    fetchGames();
  }, [userId]);

  const getGameOutcome = (game: GameHistoryItem) => {
    if (!game.winner_id) return { text: 'Draw', color: 'bg-yellow-500/20 text-yellow-500' };
    if (game.winner_id === userId) return { text: 'Won', color: 'bg-green-500/20 text-green-500' };
    return { text: 'Lost', color: 'bg-red-500/20 text-red-500' };
  };

  const getResultText = (result: string | null) => {
    switch (result) {
      case 'checkmate': return 'Checkmate';
      case 'resignation': return 'Resignation';
      case 'timeout': return 'Timeout';
      case 'stalemate': return 'Stalemate';
      case 'draw': return 'Draw';
      default: return result || 'Unknown';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const displayedGames = expanded ? games : games.slice(0, 5);

  if (loading) {
    return (
      <Card className="glass-panel border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Game History
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (games.length === 0) {
    return (
      <Card className="glass-panel border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Game History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            No completed games yet. Start playing to see your history!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-panel border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          Game History
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {displayedGames.map((game, index) => {
          const outcome = getGameOutcome(game);
          const isWhite = game.white_player_id === userId;
          const opponent = isWhite ? game.black_profile : game.white_profile;
          
          return (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary/80 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${isWhite ? 'bg-white' : 'bg-gray-800'}`} />
                <div>
                  <p className="font-medium">
                    vs {opponent?.display_name || opponent?.username || 'Unknown'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(game.completed_at)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {game.time_control && (
                  <Badge variant="outline" className="text-xs">
                    <Clock className="w-3 h-3 mr-1" />
                    {Math.floor(game.time_control / 60)}m
                  </Badge>
                )}
                <Badge className={outcome.color}>
                  {outcome.text === 'Won' && <Trophy className="w-3 h-3 mr-1" />}
                  {outcome.text}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {getResultText(game.result)}
                </Badge>
              </div>
            </motion.div>
          );
        })}
        
        {games.length > 5 && (
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? (
              <>
                <ChevronUp className="w-4 h-4 mr-2" />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4 mr-2" />
                Show More ({games.length - 5} more)
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default GameHistory;