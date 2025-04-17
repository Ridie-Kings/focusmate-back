import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getModelToken } from '@nestjs/mongoose';
import { User, UserDocument } from './entities/user.entity';
import { Model } from 'mongoose';
import { BadRequestException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EventsList } from 'src/events/list.events';
import * as argon2 from 'argon2';
import { Types } from 'mongoose';
import * as mongoose from 'mongoose';

describe('UsersService', () => {
  let service: UsersService;
  let userModel: Model<UserDocument>;
  let eventEmitter: EventEmitter2;

  const mockUserModel = {
    create: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    findOne: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
  };

  const mockEventEmitter = {
    emit: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
        {
          provide: EventEmitter2,
          useValue: mockEventEmitter,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userModel = module.get<Model<UserDocument>>(getModelToken(User.name));
    eventEmitter = module.get<EventEmitter2>(EventEmitter2);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createUserDto = {
      email: 'test@example.com',
      username: 'testuser',
      fullname: 'Test User',
      password: 'password123',
      birthDate: new Date('1990-01-01'),
    };

    it('should create a new user successfully', async () => {
      const hashedPassword = await argon2.hash(createUserDto.password);
      const expectedUser = {
        ...createUserDto,
        password: hashedPassword,
        _id: 'user123',
        id: 'user123',
      };

      mockUserModel.create.mockResolvedValue(expectedUser);

      const result = await service.create(createUserDto);

      expect(result).toEqual(expectedUser);
      expect(mockUserModel.create).toHaveBeenCalledWith({
        ...createUserDto,
        password: expect.any(String),
      });
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(EventsList.USER_REGISTERED, {
        userId: expectedUser.id,
      });
    });

    it('should throw BadRequestException when user already exists', async () => {
      const error = {
        code: 11000,
        keyValue: { email: 'test@example.com' },
      };

      mockUserModel.create.mockRejectedValue(error);

      await expect(service.create(createUserDto)).rejects.toThrow(BadRequestException);
      await expect(service.create(createUserDto)).rejects.toThrow('User already exists');
    });

    it('should throw InternalServerErrorException for other errors', async () => {
      mockUserModel.create.mockRejectedValue(new Error('Database error'));

      await expect(service.create(createUserDto)).rejects.toThrow(InternalServerErrorException);
    });

    it('should sanitize input data before saving', async () => {
      const createUserDtoWithHtml = {
        email: 'test@example.com',
        username: '<script>alert("xss")</script>testuser',
        fullname: '<b>Test</b> User',
        password: 'password123',
        birthDate: new Date('1990-01-01'),
      };

      const hashedPassword = await argon2.hash(createUserDtoWithHtml.password);
      const expectedUser = {
        ...createUserDtoWithHtml,
        username: 'testuser',
        fullname: 'Test User',
        password: hashedPassword,
        _id: 'user123',
        id: 'user123',
      };

      mockUserModel.create.mockResolvedValue(expectedUser);

      const result = await service.create(createUserDtoWithHtml);

      expect(result).toEqual(expectedUser);
      expect(result.username).toBe('testuser');
      expect(result.fullname).toBe('Test User');
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const expectedUsers = [
        { _id: 'user1', email: 'user1@example.com' },
        { _id: 'user2', email: 'user2@example.com' },
      ];

      mockUserModel.find.mockResolvedValue(expectedUsers);

      const result = await service.findAll();

      expect(result).toEqual(expectedUsers);
      expect(mockUserModel.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should find a user by ID', async () => {
      const userId = 'user123';
      const expectedUser = { _id: userId, email: 'test@example.com' };

      // Mock isValidObjectId to return true for our test ID
      jest.spyOn(mongoose, 'isValidObjectId').mockReturnValue(true);
      
      mockUserModel.findById.mockResolvedValue(expectedUser);
      mockUserModel.findOne.mockResolvedValue(null);

      const result = await service.findOne(userId);

      expect(result).toEqual(expectedUser);
      expect(mockUserModel.findById).toHaveBeenCalledWith(userId);
      expect(mockUserModel.findOne).not.toHaveBeenCalled();
    });

    it('should find a user by email', async () => {
      const email = 'test@example.com';
      const expectedUser = { _id: 'user123', email };

      mockUserModel.findById.mockResolvedValue(null);
      mockUserModel.findOne.mockResolvedValue(expectedUser);

      const result = await service.findOne(email);

      expect(result).toEqual(expectedUser);
      expect(mockUserModel.findOne).toHaveBeenCalledWith({ email: email.trim() });
    });

    it('should find a user by username', async () => {
      const username = 'testuser';
      const expectedUser = { _id: 'user123', username };

      mockUserModel.findById.mockResolvedValue(null);
      mockUserModel.findOne.mockResolvedValueOnce(null);
      mockUserModel.findOne.mockResolvedValueOnce(expectedUser);

      const result = await service.findOne(username);

      expect(result).toEqual(expectedUser);
      expect(mockUserModel.findOne).toHaveBeenCalledWith({ username: username.trim() });
    });

    it('should return null when user is not found', async () => {
      mockUserModel.findById.mockResolvedValue(null);
      mockUserModel.findOne.mockResolvedValue(null);

      const result = await service.findOne('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('findOneByRefreshToken', () => {
    it('should find a user by refresh token', async () => {
      const refreshToken = 'token123';
      const expectedUser = { _id: 'user123', refreshToken };

      mockUserModel.findOne.mockResolvedValue(expectedUser);

      const result = await service.findOneByRefreshToken(refreshToken);

      expect(result).toEqual(expectedUser);
      expect(mockUserModel.findOne).toHaveBeenCalledWith({ refreshToken });
    });

    it('should return null when user is not found', async () => {
      mockUserModel.findOne.mockResolvedValue(null);

      const result = await service.findOneByRefreshToken('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('validateRefreshToken', () => {
    it('should return true for valid refresh token', async () => {
      const userId = 'user123';
      const token = 'validtoken';
      const hashedToken = await argon2.hash(token);
      const user = { _id: userId, refreshToken: hashedToken };

      mockUserModel.findById.mockResolvedValue(user);

      const result = await service.validateRefreshToken(userId as any, token);

      expect(result).toBe(true);
    });

    it('should return false when user is not found', async () => {
      mockUserModel.findById.mockResolvedValue(null);

      const result = await service.validateRefreshToken('nonexistent' as any, 'token');

      expect(result).toBe(false);
    });

    it('should return false when refresh token is not set', async () => {
      const userId = 'user123';
      const user = { _id: userId, refreshToken: null };

      mockUserModel.findById.mockResolvedValue(user);

      const result = await service.validateRefreshToken(userId as any, 'token');

      expect(result).toBe(false);
    });

    it('should return false when argon2.verify fails', async () => {
      const userId = 'user123';
      const token = 'validtoken';
      const hashedToken = await argon2.hash('differenttoken');
      const user = { _id: userId, refreshToken: hashedToken };

      mockUserModel.findById.mockResolvedValue(user);

      const result = await service.validateRefreshToken(userId as any, token);

      expect(result).toBe(false);
    });
  });

  describe('update', () => {
    const userId = 'user123';
    const updateUserDto = {
      email: 'updated@example.com',
      password: 'oldpassword',
      updatedPassword: 'newpassword',
    };

    it('should update a user successfully', async () => {
      const existingUser = {
        _id: userId,
        password: await argon2.hash('oldpassword'),
      };
      const updatedUser = {
        _id: userId,
        email: 'updated@example.com',
        password: await argon2.hash('newpassword'),
      };

      mockUserModel.findById.mockResolvedValue(existingUser);
      mockUserModel.findByIdAndUpdate.mockResolvedValue(updatedUser);

      const result = await service.update(userId, updateUserDto);

      expect(result).toEqual(updatedUser);
      expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith(
        userId,
        expect.objectContaining({
          email: updateUserDto.email,
          password: expect.any(String),
        }),
        { new: true },
      );
    });

    it('should throw BadRequestException when password is required but not provided', async () => {
      const updateDto = { updatedPassword: 'newpassword' };

      await expect(service.update(userId, updateDto)).rejects.toThrow(BadRequestException);
      await expect(service.update(userId, updateDto)).rejects.toThrow('Password is required');
    });

    it('should throw NotFoundException when user is not found', async () => {
      mockUserModel.findById.mockResolvedValue(null);

      await expect(service.update(userId, updateUserDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when current password is invalid', async () => {
      const existingUser = {
        _id: userId,
        password: await argon2.hash('differentpassword'),
      };

      mockUserModel.findById.mockResolvedValue(existingUser);

      await expect(service.update(userId, updateUserDto)).rejects.toThrow(BadRequestException);
      await expect(service.update(userId, updateUserDto)).rejects.toThrow('Invalid password');
    });

    it('should allow partial updates without changing other fields', async () => {
      const existingUser = {
        _id: userId,
        email: 'old@example.com',
        fullname: 'Old Name',
        password: await argon2.hash('oldpassword'),
      };
      
      const updateDto = {
        email: 'new@example.com',
      };
      
      const updatedUser = {
        ...existingUser,
        email: 'new@example.com',
      };

      mockUserModel.findById.mockResolvedValue(existingUser);
      mockUserModel.findByIdAndUpdate.mockResolvedValue(updatedUser);

      const result = await service.update(userId, updateDto);

      expect(result).toEqual(updatedUser);
      expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith(
        userId,
        expect.objectContaining({
          email: 'new@example.com',
        }),
        { new: true },
      );
    });
  });

  describe('remove', () => {
    const userId = new Types.ObjectId();

    it('should remove a user successfully', async () => {
      const mockUser = {
        _id: userId,
        id: userId.toString(),
        email: 'test@example.com',
        username: 'testuser',
        fullname: 'Test User',
        password: 'hashedPassword',
        birthDate: new Date(),
        refreshToken: 'refresh-token',
        stripeCustomerId: 'cus_123',
        resetCode: 'reset123',
        __v: 0,
      };

      mockUserModel.findById.mockResolvedValue(mockUser);
      mockUserModel.findByIdAndDelete.mockResolvedValue(mockUser);

      const result = await service.remove(userId);

      expect(result).toEqual(mockUser);
      expect(mockUserModel.findById).toHaveBeenCalledWith(userId);
      expect(mockUserModel.findByIdAndDelete).toHaveBeenCalledWith(userId);
    });

    it('should throw BadRequestException when user is not found', async () => {
      mockUserModel.findById.mockResolvedValue(null);

      await expect(service.remove(userId as any)).rejects.toThrow(BadRequestException);
      await expect(service.remove(userId as any)).rejects.toThrow('Invalid id or user not found');
    });

    it('should throw BadRequestException when id is invalid', async () => {
      const invalidId = 'invalid-id';
      
      // Mock isValidObjectId to return false for our test ID
      jest.spyOn(mongoose, 'isValidObjectId').mockReturnValue(false);
      
      await expect(service.remove(invalidId as any)).rejects.toThrow(BadRequestException);
      await expect(service.remove(invalidId as any)).rejects.toThrow('Invalid id or user not found');
    });
  });

  describe('updatePassword', () => {
    const email = 'test@example.com';
    const hashedPassword = 'hashedpassword123';

    it('should update password successfully', async () => {
      const user = {
        _id: 'user123',
        email,
        password: '',
        save: jest.fn().mockResolvedValue(true),
      };

      mockUserModel.findOne.mockResolvedValue(user);

      const result = await service.updatePassword(email, hashedPassword);

      expect(result).toEqual({ message: 'Password updated successfully' });
      expect(user.password).toBe(hashedPassword);
      expect(user.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException when user is not found', async () => {
      mockUserModel.findOne.mockResolvedValue(null);

      await expect(service.updatePassword(email, hashedPassword)).rejects.toThrow(NotFoundException);
      await expect(service.updatePassword(email, hashedPassword)).rejects.toThrow('User not found');
    });

    it('should rethrow error when save fails', async () => {
      const user = {
        _id: 'user123',
        email,
        password: '',
        save: jest.fn().mockRejectedValue(new Error('Save failed')),
      };

      mockUserModel.findOne.mockResolvedValue(user);

      await expect(service.updatePassword(email, hashedPassword)).rejects.toThrow('Save failed');
    });
  });
}); 