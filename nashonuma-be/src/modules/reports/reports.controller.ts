import { Body, Controller, Get, Param, Patch, Put } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { AuthUser, Role, STAFF_ROLES } from '../../common/role.enum';
import { UpdateReportStatusDto } from './dto/update-status.dto';
import { UpsertReportDto } from './dto/upsert-report.dto';
import { ReportsService } from './reports.service';

/** "Check my child" reports. */
@Controller('reports')
export class ReportsController {
  constructor(private readonly reports: ReportsService) {}

  @Get()
  @Roles(...STAFF_ROLES, Role.Parent)
  findAll(@CurrentUser() user: AuthUser) {
    return this.reports.findAll(user);
  }

  @Put(':id')
  @Roles(Role.Parent, Role.Clinician, Role.Supervisor)
  upsert(@Param('id') id: string, @Body() dto: UpsertReportDto, @CurrentUser() user: AuthUser) {
    return this.reports.upsert(id, dto, user);
  }

  @Patch(':id')
  @Roles(Role.Clinician, Role.Supervisor)
  updateStatus(@Param('id') id: string, @Body() dto: UpdateReportStatusDto) {
    return this.reports.updateStatus(id, dto.status);
  }
}
