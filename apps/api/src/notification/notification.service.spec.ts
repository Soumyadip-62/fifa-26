import { getRepositoryToken } from '@nestjs/typeorm';
import { FirebaseService } from '../firebase/firebase.service';
import { SubscribedTokens } from './entities/notification.entity';
import { MatchEntity } from '../matches/entities/matches.entity';
import { TeamEntity } from '../teams/entitites/teams.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { NotificationService } from './notification.service';

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        { provide: FirebaseService, useValue: { send: jest.fn() } },
        ...[SubscribedTokens, MatchEntity, TeamEntity].map((entity) => ({
          provide: getRepositoryToken(entity),
          useValue: { find: jest.fn().mockResolvedValue([]) },
        })),
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
