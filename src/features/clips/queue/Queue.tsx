import { PropsWithChildren } from 'react';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { selectQueueIds, currentClipReplaced, queueClipRemoved, selectClipById, selectIsSorted } from '../clipQueueSlice';
import Clip from '../Clip';
import { useMemo } from 'react';
import { createStyles, Box } from '@mantine/core';

interface QueueProps {
  card?: boolean;
  wrapper?: (props: PropsWithChildren<{}>) => JSX.Element;
}

const useStyles = createStyles((theme) => ({
  control: {
    padding: `${theme.spacing.xs}px ${theme.spacing.md}px`,
    '&:hover': {
      backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
    },
  },
  content: {
    padding: theme.spacing.md,
    paddingTop: 0,
  },
  item: {
    border: `1px solid ${
      theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[2]
    }`,
    borderRadius: theme.radius.sm,
    marginBottom: theme.spacing.sm,
  },
  label: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  badge: {
    backgroundColor: theme.colors.blue[6],
    color: 'white',
    borderRadius: theme.radius.xl,
    padding: '0 8px',
    fontSize: theme.fontSizes.xs,
    fontWeight: 500,
  },
}));

function Queue({ wrapper, card }: QueueProps) {
  const { classes } = useStyles();
  const dispatch = useAppDispatch();
  const clipQueueIds = useAppSelector(selectQueueIds);
  const isSorted = useAppSelector(selectIsSorted);
  const clipsById = useAppSelector(state => state.clipQueue.byId);
  const Wrapper = wrapper ?? (({ children }) => <>{children}</>);
  const clips = useAppSelector((state) =>
    clipQueueIds.map((id) => selectClipById(id)(state)).filter((clip) => clip !== undefined)
  );

    // Group clips by author (streamer)
  const clipsByAuthor = useMemo(() => {
    const groups: Record<string, any[]> = {};

    clipQueueIds.forEach(id => {
      const clip = clipsById[id];
      if (!clip) return;

      const author = clip.author || 'Unknown Streamer';
      if (!groups[author]) {
        groups[author] = [];
      }
      groups[author].push(clip);
    });

    return groups;
  }, [clipQueueIds, clipsById]);


  return (
    <>
    {isSorted ? 
     <div>
      {Object.entries(clipsByAuthor)
        .sort(([authorA], [authorB]) => authorA.localeCompare(authorB))
        .map(([author, clips]) => (
          <div key={author} className={classes.item}>
            <div className={classes.control}>
              <div className={classes.label}>
                <span>{author}</span>
                <span className={classes.badge}>
                  {clips.length} {clips.length === 1 ? 'clip' : 'clips'}
                </span>
              </div>
            </div>
            <div className={classes.content}>
              {clips.map((clip) => (
                <Wrapper key={clip.id}>
                  <Clip
                    platform={clip.Platform || undefined}
                    clipId={clip.id}
                    card={card}
                    onClick={() => dispatch(currentClipReplaced(clip.id))}
                    onCrossClick={() => dispatch(queueClipRemoved(clip.id))}
                  />
                </Wrapper>
              ))}
            </div>
          </div>
        ))}
    </div> 
    :
    <>
      {clips.map((clip) => (
        <Wrapper key={clip!.id}>
          <Clip
            platform={clip!.Platform || undefined}
            key={clip!.id}
            clipId={clip!.id}
            card={card}
            onClick={() => dispatch(currentClipReplaced(clip!.id))}
            onCrossClick={() => dispatch(queueClipRemoved(clip!.id))}
          />
        </Wrapper>
      ))}
    </>
   }
  </>
);
};

export default Queue;
