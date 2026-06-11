import { Controller, Get, Query, Param } from '@nestjs/common';
import { VenuesService } from './venues.service';

@Controller('venues')
export class VenuesController {
  constructor(private readonly venuesService: VenuesService) {}

  @Get('search')
  searchVenues(@Query('v') name: string) {
    return this.venuesService.searchVenues(name);
  }

  @Get(':id')
  lookupVenue(@Param('id') id: string) {
    return this.venuesService.lookupVenue(id);
  }
}
