import { Body, Controller, Get, Param, Patch, Put } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { AuthUser, Role, STAFF_ROLES } from '../../common/role.enum';
import { UpdateWellbeingStatusDto } from './dto/update-status.dto';
import { UpsertWellbeingDto } from './dto/upsert-wellbeing.dto';
import { WellbeingService } from './wellbeing.service';

/** Mothers' SRQ-20 wellbeing checks. */
@Controller('wellbeing')
export class WellbeingController {
  constructor(private readonly wellbeing: WellbeingService) {}

  @Get()
  @Roles(...STAFF_ROLES, Role.Parent)
  findAll(@CurrentUser() user: AuthUser) {
    return this.wellbeing.findAll(user);
  }

  @Put(':id')
  @Roles(Role.Parent, Role.Clinician, Role.Supervisor)
  upsert(@Param('id') id: string, @Body() dto: UpsertWellbeingDto, @CurrentUser() user: AuthUser) {
    return this.wellbeing.upsert(id, dto, user);
  }

  @Patch(':id')
  @Roles(Role.Clinician, Role.Supervisor)
  updateStatus(@Param('id') id: string, @Body() dto: UpdateWellbeingStatusDto) {
    return this.wellbeing.updateStatus(id, dto.status);
  }
}
