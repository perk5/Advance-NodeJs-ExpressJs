class Apifeatures{
    constructor(query, queryStr){
        this.query = query
        this.queryStr = queryStr
    }

    filter(){
        const queryObj = { ...this.queryStr };

        // Step 2: Exclude fields from the filter
        const excludedFields = ['sort', 'limit', 'fields', 'page'];
        excludedFields.forEach(el => delete queryObj[el]);

        // Step 3: Replace operators like gte, gt, etc.
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

        // Step 4: Parse back to object
        const mongoQuery = JSON.parse(queryStr);
        this.query = this.query.find(mongoQuery);

        return this;
    }

    sort(){
        if (this.queryStr.sort){
            const sortBy = this.queryStr.sort.split(",").join(" ")
            this.query = this.query.sort(sortBy)
        }else{
            this.query = this.query.sort('-duration')
        }
        return this
    }

    limitfields(){
        if(this.queryStr.fields){
            const fields = this.queryStr.fields.split(',').join(" ")
            this.query = this.query.select(fields)
        }else{
            this.query = this.query.select('__V')
        }
        return this
    }

    paginate(){
        const page = this.queryStr.page * 1|| 1;
        const limit = this.queryStr.limit * 1|| 10
        const skip = (page - 1) * limit
        this.query = this.query.skip(skip).limit(limit)
        

        // if(this.queryStr.page){
        //     const count = await movie.countDocuments()
        //     if (skip >= count){
        //         return res.json({
        //             status: "Failed to retrive."
        //         })
        //     }
        // }
        return this
    }

    allMovies(){
        this.query = this.query.find({})
        return this
    }
}

module.exports = Apifeatures 