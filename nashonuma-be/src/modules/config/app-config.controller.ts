import { Body, Controller, Get, Put } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { AuthUser, Role } from '../../common/role.enum';
import { AppConfigService } from './app-config.service';
import { SdqConfigDto } from './dto/sdq-config.dto';

@Controller('config')
export class AppConfigController {
  constructor(private readonly config: AppConfigService) {}

  /** Any signed-in user: the parent's phone needs the SDQ wording too. */
  @Get()
  findAll() {
    return this.config.findAll();
  }

  @Put('sdq')
  @Roles(Role.Admin)
  saveSdq(@Body() dto: SdqConfigDto, @CurrentUser() user: AuthUser) {
    return this.config.saveSdq(dto, user);
  }
}
