import { Channel } from "@/models/channel";
import { rel_build_of } from "@/utils/neo4j/rel_build_of";

describe('rel_build_of function', () => {
  it('builds relationships from an instance', async () => {
    const mockChannelInstance = Channel.buildFromRecord({
      labels: ['Channel'],
      properties: {
        id: 0,
        is_public: undefined,
        title: undefined,
        username: undefined,
        created_at: undefined,
        channel_link: undefined,
        need_to_scan: false
      }
    });

    const expectedOutputFromInstance = [
      { label: 'Channel' },
      { direction: 'out', name: 'POST_OF' },
      { label: 'ChannelPost' },
      { direction: 'in', name: 'POST_FORWARD' },
      { label: 'ChannelPost' },
      { direction: 'in', name: 'USER_QUOUTED' },
      { label: 'User' },
      { direction: 'out', name: 'USER_QUOUTED' },
      { label: 'ChannelPost' },
      { direction: 'out', name: 'POST_COMMENTED' },
      { label: 'PostComment' }
    ];

    const resultFromInstance = rel_build_of({ fromI: mockChannelInstance })
      .posts
      .forwarded_from
      .forward_from_user
      .appears_in_posts
      .commented
      .build();

    expect(resultFromInstance).toEqual(expectedOutputFromInstance);
  });

  it('builds relationships from a model', async () => {
    const expectedOutputFromModel = [
      { label: 'Channel' },
      { direction: 'out', name: 'BELONGS_TO_LOG' },
      { label: 'ChannelScanLog' },
      { direction: 'out', name: 'HANDLED_BY' },
      { label: 'Session' },
      { direction: 'in', name: 'HANDLED_BY' },
      { label: 'ChannelScanLog' }
    ];

    const resultFromModel = rel_build_of({ fromM: Channel })
      .added_by_log
      .handled_by
      .scan_logs
      .build();

    expect(resultFromModel).toEqual(expectedOutputFromModel);
  });

  it('builds relationships from a model with identifiers', async () => {
    const expectedOutputFromModel = [
      { label: 'Channel' },
      { direction: 'out', name: 'BELONGS_TO_LOG', identifier: 'a' },
      { label: 'ChannelScanLog', identifier: 'b' },
      { direction: 'out', name: 'HANDLED_BY' },
      { label: 'Session' },
      { direction: 'in', name: 'HANDLED_BY', identifier: 'c' },
      { label: 'ChannelScanLog', identifier: 'd' }
    ];

    const resultFromModel = rel_build_of({ fromM: Channel })
      .added_by_log({ relIdentifier: 'a', nodeIdentifier: 'b' })
      .handled_by
      .scan_logs({ relIdentifier: 'c', nodeIdentifier: 'd' })
      .build();

    expect(resultFromModel).toEqual(expectedOutputFromModel);
  });

  it('throws an error if neither fromI nor fromM is provided', async () => {
    expect(() => {
      rel_build_of({});
    }).toThrow('Either fromI or fromM must be provided');
  });
});
