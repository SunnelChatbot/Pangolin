import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import {
  CreateUserCredentialDto,
  CreateUserDto,
  RegisterUserDto,
} from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { User, UserDocument } from "./schema/user.schema";
import { SoftDeleteModel } from "soft-delete-plugin-mongoose";
import mongoose from "mongoose";
import { compareSync, genSaltSync, hashSync } from "bcrypt";
import IUser from "../interfaces/user/user.interface";

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: SoftDeleteModel<UserDocument>
  ) {}

  genHashPassword(password: string) {
    const saltRounds = 10;
    const salt = genSaltSync(saltRounds);
    const hash = hashSync(password, salt);
    return hash;
  }

  async isValidPassword(password: string, hashPassword: string) {
    const isValid = compareSync(password, hashPassword);
    return isValid;
  }
  findUserById(_id: mongoose.Types.ObjectId) {
    return this.userModel.findOne({ _id });
  }

  async findUserByUsername(username: string): Promise<IUser> {
    return await this.userModel.findOne({ username });
  }
  async findByResetPasswordToken(resetPasswordToken: string): Promise<IUser> {
    return await this.userModel.findOne({ resetPasswordToken });
  }

  async findUserByEmail(email: string) {
    return await this.userModel.findOne({ email });
  }

  async checkAlreadyExit(email, username) {
    const isAlreadyEmail = await this.findUserByUsername(email);
    const isAlreadyUsername = await this.findUserByUsername(username);
    if (isAlreadyEmail || isAlreadyUsername) {
      return true;
    } else {
      return false;
    }
  }
  async create(createUserDto: CreateUserDto) {
    const IsAlready = await this.checkAlreadyExit(
      createUserDto.email,
      createUserDto.username
    );
    if (IsAlready) {
      return {
        status: 400,
        message: global.getLang("EmailOrPasswordAlready"),
      };
    }
    const passwordHashed = this.genHashPassword(createUserDto.password);
    const user = this.userModel.create({
      ...createUserDto,
      status: "ACTIVE",
      password: passwordHashed,
    });
    const { password, ...result } = (await user).toObject();
    return result;
  }
  async createUserSocialMedia(createUserDto: CreateUserCredentialDto) {
    const user = this.userModel.create({
      ...createUserDto,
      status: "ACTIVE",
    });
    const { password, ...result } = (await user).toObject();
    return result;
  }
  async register(createUserDto: RegisterUserDto) {
    const IsAlready = await this.checkAlreadyExit(
      createUserDto.email,
      createUserDto.username
    );
    if (IsAlready) {
      return {
        status: 400,
        message: global.getLang("EmailOrPasswordAlready"),
      };
    }
    const passwordHashed = this.genHashPassword(createUserDto.password);
    const user = this.userModel.create({
      ...createUserDto,
      role: "USER",
      password: passwordHashed,
    });
    const { password, ...result } = (await user).toObject();
    return {
      status: 200,
      message: "Created successfully",
      result,
    };
  }

  findAll() {
    return this.userModel.find();
  }

  findUserToken(refreshToken: string) {
    return this.userModel.findOne({ refresh_token: refreshToken });
  }
  findOne(id: mongoose.Types.ObjectId) {
    const user = this.userModel.findOne({ id });
    return user;
  }

  update(_id: mongoose.Types.ObjectId, updateUserDto) {
    // console.log(_id);
    // console.log(updateUserDto);
    return this.userModel.updateOne({ _id }, { ...updateUserDto });
  }
  updateRefreshToken(_id: mongoose.Types.ObjectId, refresh_token: string) {
    return this.userModel.updateOne({ _id }, { refresh_token });
  }

  remove(id: mongoose.Types.ObjectId) {
    return this.userModel.deleteOne({ id });
  }
}
