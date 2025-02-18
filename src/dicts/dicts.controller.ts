import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Query,
} from "@nestjs/common";
import { DictsService } from "./dicts.service";
import { CreateDictDto, UpdateDictDto, AddWordDto, UpdateUserSharedWithDto } from "./dto/index";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { ParseMongoIdPipe } from "src/common/pipes/parse-mongo-id.pipe";
import { Dict } from "./entities/dict.entity";
import { User } from "src/users/entities/user.entity";
import { GetUser } from "src/users/decorators/get-user.decorator";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";

@ApiTags("Dicts")
@ApiBearerAuth()
@Controller("dicts")
@UseGuards(JwtAuthGuard)
export class DictsController {
  constructor(private readonly dictsService: DictsService) {}

  @Post()
  @ApiOperation({ summary: "Create a new dict" })
  @ApiResponse({ status: 201, description: "Dict successfully created" })
  @ApiResponse({ status: 400, description: "Invalid data provided" })
  async create(
    @Body() createDictDto: CreateDictDto, @GetUser() user: User): Promise<Dict> {
    return this.dictsService.create(user._id.toString(), createDictDto);
  }

  @Get()
  @ApiOperation({ summary: "Retrieve all dicts of the authenticated user" })
  @ApiResponse({ status: 200, description: "List of dicts retrieved" })
  async findAll(
    @GetUser() user: User,
  ): Promise<Dict[]> {
    return this.dictsService.findAll(user._id.toString());
  }

  // @Get("all")
  // async findAllPublic(): Promise<Dict[]> {
  //   return this.dictsService.findAllPublic();
  // }

  @Get(":id")
  @ApiOperation({ summary: "Retrieve a specific dict by ID" })
  @ApiResponse({ status: 403, description: "Unauthorized access" })
  @ApiResponse({ status: 404, description: "Dict not found" })
  @ApiResponse({ status: 200, description: "Dict retrieved successfully" })
  async findOne(@Param("id", ParseMongoIdPipe) dictId: string, @GetUser() user: User): Promise<Dict> {
    return this.dictsService.findOne(dictId, user._id.toString());
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a dict by ID" })
  @ApiResponse({ status: 200, description: "Dict updated successfully" })
  @ApiResponse({ status: 400, description: "Invalid data provided" })
  @ApiResponse({ status: 403, description: "Unauthorized access" })
  @ApiResponse({ status: 404, description: "Dict not found" })
  async update(
    @Param("id", ParseMongoIdPipe) dictId: string,
    @Body() updateDictDto: UpdateDictDto,
    @GetUser() user: User,
  ): Promise<Dict> {
    return this.dictsService.update(dictId, updateDictDto, user._id.toString());
  }

  @Patch(":id/sharedwith")
  @ApiOperation({ summary: "add/delete user shared with" })
  @ApiResponse({ status: 200, description: "Added /deleted Ok, Dict updated successfully" })
  @ApiResponse({ status: 400, description: "Invalid data provided" })
  @ApiResponse({ status: 403, description: "Unauthorized access" })
  @ApiResponse({ status: 404, description: "Dict not found" })
  async updateUsersDict(
    @Param("id", ParseMongoIdPipe) dictId: string,
    @Body() updateUserSharedWithDto: UpdateUserSharedWithDto,
    @GetUser() user: User,
  ): Promise<Dict> {
    return this.dictsService.updateUsersDict(dictId, updateUserSharedWithDto, user._id.toString());
  }

  @Patch(":id/addword")
  @ApiOperation({ summary: "add a Word to a Dict by ID" })
  @ApiResponse({ status: 200, description: "Added Word succesfully" })
  @ApiResponse({ status: 400, description: "Invalid data provided" })
  @ApiResponse({ status: 403, description: "Unauthorized access" })
  @ApiResponse({ status: 404, description: "Dict not found" })
  async addWord(
    @Param("id", ParseMongoIdPipe) dictId: string,
    @Body() addWordDto: AddWordDto,
    @GetUser() user: User,
  ): Promise<Dict> {
    return this.dictsService.addWord(dictId, addWordDto, user._id.toString());
  }

  @Patch(":id/deleteword")
  @ApiOperation({ summary: "add a Word to a Dict by ID" })
  @ApiResponse({ status: 200, description: "Added Word succesfully" })
  @ApiResponse({ status: 400, description: "Invalid data provided" })
  @ApiResponse({ status: 403, description: "Unauthorized access" })
  @ApiResponse({ status: 404, description: "Dict not found" })
  async deleteWord(
    @Param("id", ParseMongoIdPipe) dictId: string,
    @Body() word: String,
    @GetUser() user: User,
  ): Promise<Dict> {
    return this.dictsService.deleteWord(dictId, word, user._id.toString());
  }

  @Patch(":id/delete")
  @ApiOperation({ summary: "Soft delete a dict by ID (isDeleted: true)" })
  @ApiResponse({ status: 200, description: "Dict deleted successfully" })
  @ApiResponse({ status: 403, description: "Unauthorized access" })
  @ApiResponse({ status: 404, description: "Dict not found" })
  async softDelete(@Param("id", ParseMongoIdPipe) id: string, @GetUser() user: User): Promise<Dict> {
    return this.dictsService.softDelete(id, user._id.toString());
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a dict by ID" })
  @ApiResponse({ status: 200, description: "Dict deleted successfully" })
  @ApiResponse({ status: 403, description: "Unauthorized access" })
  @ApiResponse({ status: 404, description: "Dict not found" })
  async remove(@Param("id", ParseMongoIdPipe) id: string, @GetUser() user: User): Promise<Dict> {
    return this.dictsService.remove(id, user._id.toString());
  }
}
