import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { AuthUser, Role } from '../../common/role.enum';
import { ChildrenService } from './children.service';
import { CreateAssessmentDto } from './dto/create-assessment.dto';

@Controller('children')
export class ChildrenController {
  constructor(private readonly children: ChildrenService) {}

  /** Staff see every child; a parent sees only her own. */
  @Get()
  findAll(@CurrentUser() user: AuthUser) {
    return this.children.findAll(user);
  }

  /** Saves a MORBAS assessment, creating the child if the reg number is new. */
  @Post(':id/assessments')
  @Roles(Role.Clinician)
  addAssessment(@Param('id') id: string, @Body() dto: CreateAssessmentDto, @CurrentUser() user: AuthUser) {
    return this.children.addAssessment(id, dto, user);
  }
}
