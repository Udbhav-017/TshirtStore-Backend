class WhereClause {
    constructor(base, bigQ){
        this.base = base;         //  base = model.find  where model = (User, Product, etc..)
        this.bigQ = bigQ;         //  ?search=coder&page=22&category=shortssleeves&rating[gte]=4   
    }

     search(){
        const searchWord = this.bigQ.search ? {
            name: {
                $regex: this.bigQ.search,
                $options: 'i'     // i -> canse insensitivity
            }
        } : {};

        this.base =  this.base.find({...searchWord});
        return this;
    }

    filter(){
        const  copyQ =  {...this.bigQ};

        delete copyQ['search'];
        delete copyQ['limit'];
        delete copyQ['page'];
        delete copyQ['pageSize']

        // convert bigQ into a string => copyQ
        let stringOfCopyQ = JSON.stringify(copyQ);    // Json to string

        stringOfCopyQ = stringOfCopyQ.replace(/\b(gte|lte|gt|lt)\b/g, m => `$${m}`);

        const jsonOfCopyQ = JSON.parse(stringOfCopyQ);   // Back to json

        this.base =  this.base.find(jsonOfCopyQ);
        return this;
    }

     pager(){
        let currentPage = this.bigQ.page || 1;
        let pageSize = this.bigQ.pageSize || 10;
        const skipResults = pageSize * ( currentPage - 1); 
        
        this.base =  this.base.limit(pageSize).skip(skipResults);
    }
}

module.exports = WhereClause;